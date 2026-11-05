"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Silent looping clip in the highlights row. Nothing downloads until the clip
 * is on screen, and it stops decoding when scrolled away or hidden behind the
 * project modal. Browsers pick the first source they can play: AV1 is the
 * smallest, H.264 covers everything else.
 *
 * `base` is the path shared by the clip's three files: `-av1.mp4`, `-h264.mp4`
 * and `-poster.webp`. `width` and `height` only reserve its shape on the page.
 */
export default function HighlightLoop({
  base,
  width,
  height,
  label,
  paused,
}: {
  base: string;
  width: number;
  height: number;
  label: string;
  paused: boolean;
}) {
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

  return (
    <video
      ref={videoRef}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="none"
      poster={`${base}-poster.webp`}
      // The memory tracker's reload would stop playback, and this already pauses
      // itself off screen.
      data-exclude-memory-management="true"
      aria-label={label}
      className="block w-full h-auto border border-line bg-white"
    >
      <source
        src={`${base}-av1.mp4`}
        type='video/mp4; codecs="av01.0.05M.08"'
      />
      <source src={`${base}-h264.mp4`} type="video/mp4" />
    </video>
  );
}
