"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState, type RefObject } from "react";
import type { Entry, Still } from "../data/work";

/**
 * One cell of the wall: a still cover that comes alive when it's pointed at.
 * A project plays a short clip or steps through its images, and nothing for
 * that is downloaded until then. A loop plays quietly on its own while it's on
 * screen. If anything fails to load or play, the cover simply stays up.
 */

// Long enough that a mouse crossing the wall, or a fast scroll past a cell,
// doesn't start any downloads.
const HOVER_DELAY_MS = 120;
const SCROLL_DELAY_MS = 250;

// How long a slide stays up before the next fades in over it.
const SLIDE_HOLD_MS = 1800;
const FIRST_SLIDE_DELAY_MS = 150;

// A cell is roughly this shape. An image wider than that is cropped to fit, so
// it's drawn wider than the cell and needs a bigger file to stay sharp.
const CELL_ASPECT = 1.6;

/** How wide a cover is drawn, so the browser fetches a file that matches. */
function wallSizes(still: Still, featured?: boolean) {
  const scale = Math.max(1, still.w / still.h / CELL_ASPECT);
  const vw = (n: number) => `${Math.min(100, Math.round(n * scale))}vw`;
  return featured
    ? `(max-width: 699px) ${vw(100)}, (max-width: 1023px) ${vw(67)}, ${vw(50)}`
    : `(max-width: 699px) ${vw(50)}, (max-width: 1023px) ${vw(34)}, ${vw(25)}`;
}

const prefersStillness = () => {
  const connection = (navigator as any).connection;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    Boolean(connection?.saveData) ||
    /2g/.test(connection?.effectiveType ?? "")
  );
};

/**
 * Whether the cell should be moving: pointed at or focused with a mouse and
 * keyboard, or (for the featured cell only) on screen on a touch device.
 */
function useActive(ref: RefObject<HTMLElement>, onScreenCounts: boolean) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const cell = ref.current;
    if (!cell || prefersStillness()) return;

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
      cell.addEventListener("pointerenter", enter);
      cell.addEventListener("pointerleave", stop);
      cell.addEventListener("focus", enter);
      cell.addEventListener("blur", stop);
      return () => {
        clearTimeout(timer);
        cell.removeEventListener("pointerenter", enter);
        cell.removeEventListener("pointerleave", stop);
        cell.removeEventListener("focus", enter);
        cell.removeEventListener("blur", stop);
      };
    }

    if (!onScreenCounts) return;
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start(SCROLL_DELAY_MS) : stop()),
      { threshold: 0.6 }
    );
    observer.observe(cell);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, onScreenCounts]);

  return active;
}

function Clip({ base, active }: { base: string; active: boolean }) {
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
      // cell stopped again straight away. Either way the cover stays up.
      video.play().catch(() => {});
      return;
    }

    video.pause();
    setPlaying(false);
    // Rewind once it has faded out, ready to start from the top next time.
    const rewind = setTimeout(() => {
      video.currentTime = 0;
    }, 400);
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
      className="cell-layer"
      data-on={playing || undefined}
    >
      <source src={`${base}-av1.mp4`} type='video/mp4; codecs="av01.0.05M.08"' />
      <source src={`${base}-h264.mp4`} type="video/mp4" />
    </video>
  );
}

function Slides({
  images,
  active,
  featured,
}: {
  images: Still[];
  active: boolean;
  featured?: boolean;
}) {
  // The slide on top (null while the cover is showing) and the one beneath it,
  // which stays solid so the cover doesn't flash through during the fade.
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
        const still = images[index];
        return (
          <Image
            key={still.src}
            src={still.src}
            alt=""
            aria-hidden="true"
            fill
            loading="eager"
            quality={60}
            sizes={wallSizes(still, featured)}
            onLoad={() =>
              setLoaded((prev) => (prev.includes(index) ? prev : [...prev, index]))
            }
            // Skip a slide that won't load rather than stopping on it.
            onError={() =>
              setNext((current) =>
                current === index ? (index + 1) % images.length : current
              )
            }
            className="cell-layer"
            data-on={index === shown || index === beneath || undefined}
            style={{ zIndex: index === shown ? 2 : index === beneath ? 1 : 0 }}
          />
        );
      })}
    </>
  );
}

/** A clip that plays by itself, silently, while it's on screen. */
function Loop({ base, paused }: { base: string; paused: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting)
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused && !prefersStillness()) {
      // Rejected only if the browser refuses to play; the poster stays up.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, paused]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      disablePictureInPicture
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className="cell-layer"
      data-on
    >
      <source src={`${base}-av1.mp4`} type='video/mp4; codecs="av01.0.05M.08"' />
      <source src={`${base}-h264.mp4`} type="video/mp4" />
    </video>
  );
}

export default memo(function Cell({
  entry,
  order,
  open,
  off,
  paused,
  count,
  onOpen,
}: {
  entry: Entry;
  // Position on the wall, which decides how eagerly the cover loads.
  order: number;
  open: boolean;
  // Dimmed because it's outside the chosen filter.
  off: boolean;
  // Something is covering the wall, so nothing on it should be playing.
  paused: boolean;
  count: number;
  onOpen: (slug: string) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const active = useActive(ref, Boolean(entry.featured)) && !paused;

  return (
    <a
      ref={ref}
      href={`#${entry.slug}`}
      className="cell"
      data-cell={entry.slug}
      data-featured={entry.featured || undefined}
      data-off={off || undefined}
      aria-expanded={entry.kind === "loop" ? undefined : open}
      onClick={(event) => {
        // Leave modified clicks alone, so a project can open in a new tab.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        onOpen(entry.slug);
      }}
    >
      <span className="cell-media">
        <Image
          src={entry.cover.src}
          alt={
            entry.kind === "about"
              ? "About Jakob Backhouse — illustration of an artist drawing at a desk by a window"
              : entry.title
          }
          fill
          quality={entry.slug === "3d-animation" ? 75 : 60}
          priority={order === 0}
          loading={order === 0 ? undefined : order < 5 ? "eager" : "lazy"}
          sizes={wallSizes(entry.cover, entry.featured)}
          className="cell-cover"
        />
        {entry.loop && <Loop base={entry.loop} paused={paused} />}
        {entry.motion?.kind === "clip" && (
          <Clip base={entry.motion.base} active={active} />
        )}
        {entry.motion?.kind === "slides" && (
          <Slides
            images={entry.motion.images}
            active={active}
            featured={entry.featured}
          />
        )}
      </span>
      <span className="cell-label">
        <span className="cell-title">{entry.title}</span>
        {entry.note ? (
          <span className="cell-note">{entry.note}</span>
        ) : (
          count > 1 && <span className="cell-note cell-count">{count}</span>
        )}
      </span>
    </a>
  );
});
