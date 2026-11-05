"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HOVER_ZOOM =
  "lg:[@media(hover:hover)_and_(pointer:fine)]:hover:z-20 lg:[@media(hover:hover)_and_(pointer:fine)]:hover:scale-[2]";

// How much of the screen an enlarged clip may fill.
const ENLARGED_WIDTH = 0.92;
const ENLARGED_HEIGHT = 0.88;
const ENLARGE_MS = 500;
const HOVER_ZOOM_MS = 300;

// Above the site header (z-[200]), and kept while the clip travels back so it
// doesn't drop behind the trailer on the way. `!` beats the hover styles, which
// still apply because the pointer is usually over the clip when it's clicked.
const LIFTED =
  "!z-[260] !transition-transform !duration-500 !ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:!transition-none";

/**
 * Silent looping clip in the highlights row. Nothing downloads until the clip
 * is on screen, and it stops decoding when scrolled away or hidden behind the
 * project modal. Browsers pick the first source they can play: AV1 is the
 * smallest, H.264 covers everything else.
 *
 * `base` is the path shared by the clip's three files: `-av1.mp4`, `-h264.mp4`
 * and `-poster.webp`. `width` and `height` only reserve its shape on the page.
 *
 * On desktop the clip grows while hovered, over whatever is beside it, without
 * moving anything else. `zoomOrigin` is the Tailwind class for the point it
 * grows from. The z-index transitions too, so a clip stays on top as it shrinks.
 *
 * Clicking it moves the same video to the middle of the screen, so it never
 * stops or reloads. Clicking anywhere, Escape or scrolling sends it back.
 */
export default function HighlightLoop({
  base,
  width,
  height,
  label,
  paused,
  zoomOrigin,
}: {
  base: string;
  width: number;
  height: number;
  label: string;
  paused: boolean;
  zoomOrigin: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [enlargedTransform, setEnlargedTransform] = useState<string | null>(
    null
  );
  const [returning, setReturning] = useState(false);
  // Tracked by hand rather than left to `:hover`, because a clip that shrinks
  // away from a still mouse stays marked as hovered until the mouse moves.
  const [pointerOver, setPointerOver] = useState(false);
  // The magnifier only appears once the clip has finished growing to this size.
  const [settledSize, setSettledSize] = useState<"hover" | "enlarged" | null>(
    null
  );
  const enlarged = enlargedTransform !== null;

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
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (inView && !paused && !reducedMotion) {
      // Rejected only if the browser refuses to play; the poster stays up.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, paused]);

  const enlarge = () => {
    const video = videoRef.current;
    const box = boxRef.current;
    if (!video || !box) return;

    // Measured from the box because the video itself may be mid hover zoom.
    const rect = box.getBoundingClientRect();
    const screenWidth = document.documentElement.clientWidth;
    const screenHeight = window.innerHeight;
    const scale = Math.min(
      (screenWidth * ENLARGED_WIDTH) / rect.width,
      (screenHeight * ENLARGED_HEIGHT) / rect.height
    );

    // Keeps the zoom origin, so going from hovered to enlarged doesn't jump.
    const [originX, originY] = getComputedStyle(video)
      .transformOrigin.split(" ")
      .map(parseFloat);
    const moveX =
      screenWidth / 2 - rect.left - originX - scale * (rect.width / 2 - originX);
    const moveY =
      screenHeight / 2 - rect.top - originY - scale * (rect.height / 2 - originY);

    setReturning(false);
    setEnlargedTransform(`translate(${moveX}px, ${moveY}px) scale(${scale})`);
  };

  const sendBack = useCallback(() => {
    setEnlargedTransform(null);
    setReturning(true);
    setPointerOver(false);
  }, []);

  useEffect(() => {
    if (!returning) return;
    const timer = setTimeout(() => setReturning(false), ENLARGE_MS);
    return () => clearTimeout(timer);
  }, [returning]);

  useEffect(() => {
    if (!enlarged) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") sendBack();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", sendBack);
    // Capture, because the page's scrolling may not happen on the window itself.
    window.addEventListener("scroll", sendBack, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", sendBack);
      window.removeEventListener("scroll", sendBack, { capture: true });
    };
  }, [enlarged, sendBack]);

  const size = enlarged ? "enlarged" : pointerOver ? "hover" : null;
  useEffect(() => {
    if (!size) {
      setSettledSize(null);
      return;
    }
    const timer = setTimeout(
      () => setSettledSize(size),
      size === "enlarged" ? ENLARGE_MS : HOVER_ZOOM_MS
    );
    return () => clearTimeout(timer);
  }, [size]);
  const settled = size !== null && settledSize === size;

  const toggle = () => (enlarged ? sendBack() : enlarge());

  return (
    <div ref={boxRef}>
      <div
        aria-hidden="true"
        onClick={sendBack}
        className={`fixed inset-0 z-[250] bg-black/80 transition-opacity duration-500 motion-reduce:transition-none ${
          enlarged ? "opacity-100" : "pointer-events-none opacity-0"
        } ${settled ? "cursor-zoom-out" : ""}`}
      />
      <video
        ref={videoRef}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="none"
        poster={`${base}-poster.webp`}
        // The memory tracker's reload would stop playback, and this already
        // pauses itself off screen.
        data-exclude-memory-management="true"
        aria-label={label}
        role="button"
        tabIndex={0}
        aria-expanded={enlarged}
        onClick={toggle}
        onPointerMove={() => setPointerOver(true)}
        onPointerLeave={() => setPointerOver(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        style={enlargedTransform ? { transform: enlargedTransform } : undefined}
        className={`relative z-10 block w-full h-auto border bg-white transition-[transform,z-index] duration-300 ease-out motion-reduce:transition-none ${zoomOrigin} ${
          pointerOver ? HOVER_ZOOM : ""
        } ${
          enlarged ? "border-transparent" : "border-line"
        } ${
          !settled
            ? "cursor-default"
            : enlarged
              ? "cursor-zoom-out"
              : "cursor-zoom-in"
        } ${
          enlarged || returning ? LIFTED : ""
        }`}
      >
        <source
          src={`${base}-av1.mp4`}
          type='video/mp4; codecs="av01.0.05M.08"'
        />
        <source src={`${base}-h264.mp4`} type="video/mp4" />
      </video>
    </div>
  );
}
