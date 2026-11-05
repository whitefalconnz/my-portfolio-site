"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * The moving layer of a home page tile, drawn over its still poster. A tile
 * plays a short clip or steps through a set of images while it's hovered, or
 * while it's on screen on a touch device. Nothing downloads until then, and if
 * anything fails to load or play, the poster simply stays up.
 */

export type TileMotionMedia =
  // `base` is the path shared by the clip's `-av1.mp4` and `-h264.mp4` files.
  | { kind: "clip"; base: string }
  // Sizes are only used to request a file sharp enough for the tile's crop. End
  // the list with the tile's own poster so the loop comes back round to it.
  | {
      kind: "slides";
      images: { src: string; width: number; height: number }[];
    };

// Long enough that a mouse crossing the grid, or a fast scroll past a tile,
// doesn't start any downloads.
const HOVER_DELAY_MS = 120;
const SCROLL_DELAY_MS = 250;

// How long a slide stays up before the next fades in over it (`duration-500`).
const SLIDE_HOLD_MS = 1800;
const FIRST_SLIDE_DELAY_MS = 150;

// Marks these as off limits to the home page's media clearing, because they
// load on demand and already stop when the tile does.
const KEEP_LOADED = { "data-exclude-memory-management": "true" };

function useTileActive(rootRef: RefObject<HTMLDivElement>) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const tile = root?.closest<HTMLElement>(".group");
    if (!root || !tile) return;

    // Stay still for anyone who has asked for less motion or less data.
    const connection = (navigator as any).connection;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      connection?.saveData ||
      /2g/.test(connection?.effectiveType ?? "")
    ) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const start = (delay: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => setActive(true), delay);
    };
    const stop = () => {
      clearTimeout(timer);
      setActive(false);
    };

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      const enter = () => start(HOVER_DELAY_MS);
      tile.addEventListener("pointerenter", enter);
      tile.addEventListener("pointerleave", stop);
      return () => {
        clearTimeout(timer);
        tile.removeEventListener("pointerenter", enter);
        tile.removeEventListener("pointerleave", stop);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) =>
        entry.isIntersecting ? start(SCROLL_DELAY_MS) : stop(),
      { threshold: 0.6 }
    );
    observer.observe(root);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [rootRef]);

  return active;
}

function TileClip({ base, active }: { base: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (active) setRequested(true);
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      // Rejected if the browser refuses, as in iOS Low Power Mode, or if the
      // tile stopped again straight away. Either way the poster stays up.
      video.play().catch(() => {});
      return;
    }

    video.pause();
    setPlaying(false);
    // Rewind once it has faded out, ready to start from the top next time.
    const rewind = setTimeout(() => {
      video.currentTime = 0;
    }, 500);
    return () => clearTimeout(rewind);
  }, [active, requested]);

  if (!requested) return null;

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
        playing ? "opacity-100" : "opacity-0"
      }`}
      {...KEEP_LOADED}
    >
      <source
        src={`${base}-av1.mp4`}
        type='video/mp4; codecs="av01.0.05M.08"'
      />
      <source src={`${base}-h264.mp4`} type="video/mp4" />
    </video>
  );
}

function TileSlides({
  images,
  active,
  tileAspectRatio,
  sizes,
  quality,
}: {
  images: { src: string; width: number; height: number }[];
  active: boolean;
  tileAspectRatio: number;
  sizes: (scale: number) => string;
  quality: number;
}) {
  // The slide on top (null while the poster is showing) and the one beneath it,
  // which stays solid so the poster doesn't flash through during the fade.
  const [shown, setShown] = useState<number | null>(null);
  const [beneath, setBeneath] = useState<number | null>(null);
  // Which slide is up next. It carries over between hovers, so the next hover
  // picks up where the last one stopped.
  const [next, setNext] = useState(0);
  const [requested, setRequested] = useState<number[]>([]);
  const [loaded, setLoaded] = useState<number[]>([]);

  useEffect(() => {
    if (!active) {
      setShown(null);
      setBeneath(null);
      return;
    }

    setRequested((prev) => (prev.includes(next) ? prev : [...prev, next]));
    if (!loaded.includes(next)) return; // Picked up again once it has loaded.

    const timer = setTimeout(
      () => {
        setBeneath(shown);
        setShown(next);
        setNext((next + 1) % images.length);
      },
      shown === null ? FIRST_SLIDE_DELAY_MS : SLIDE_HOLD_MS
    );
    return () => clearTimeout(timer);
    // `shown` only ever changes along with `next`, so it needn't restart this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, next, loaded, images.length]);

  return (
    <>
      {requested.map((index) => {
        const image = images[index];
        // A wider image is cropped into the tile, so it's drawn wider than the
        // tile and needs a bigger file to stay sharp.
        const scale = Math.max(
          1,
          image.width / image.height / tileAspectRatio
        );
        return (
          <Image
            key={image.src}
            src={image.src}
            alt=""
            aria-hidden="true"
            fill
            loading="eager"
            quality={quality}
            sizes={sizes(scale)}
            onLoad={() =>
              setLoaded((prev) =>
                prev.includes(index) ? prev : [...prev, index]
              )
            }
            // Skip a slide that won't load rather than stopping on it.
            onError={() =>
              setNext((current) =>
                current === index ? (index + 1) % images.length : current
              )
            }
            className={`object-cover transition-opacity duration-500 ${
              index === shown || index === beneath
                ? "opacity-100"
                : "opacity-0"
            }`}
            style={{ zIndex: index === shown ? 2 : index === beneath ? 1 : 0 }}
            {...KEEP_LOADED}
          />
        );
      })}
    </>
  );
}

export default function TileMotion({
  media,
  paused,
  tileAspectRatio,
  sizes,
  quality,
}: {
  media: TileMotionMedia;
  paused: boolean;
  tileAspectRatio: number;
  sizes: (scale: number) => string;
  quality: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const active = useTileActive(rootRef) && !paused;

  return (
    <div ref={rootRef} className="absolute inset-0 pointer-events-none">
      {media.kind === "clip" ? (
        <TileClip base={media.base} active={active} />
      ) : (
        <TileSlides
          images={media.images}
          active={active}
          tileAspectRatio={tileAspectRatio}
          sizes={sizes}
          quality={quality}
        />
      )}
    </div>
  );
}
