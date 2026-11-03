"use client";

import { useEffect, useRef, useState } from "react";

const BASE = "/videos/duck-hunting-season-wip-v01a";

/**
 * Silent looping clip in the highlights row. Nothing downloads until the clip
 * is on screen, and it stops decoding when scrolled away or hidden behind the
 * project modal. Browsers pick the first source they can play: AV1 is the
 * smallest, H.264 covers everything else.
 */
export default function HighlightLoop({ paused }: { paused: boolean }) {
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
      width={1280}
      height={722}
      muted
      loop
      playsInline
      preload="none"
      poster={`${BASE}-poster.webp`}
      // The memory tracker's reload would stop playback, and this already pauses
      // itself off screen.
      data-exclude-memory-management="true"
      aria-label="Duck Hunting Season, work in progress animation loop"
      className="block w-full h-auto border border-line bg-white"
    >
      <source
        src={`${BASE}-av1.mp4`}
        type='video/mp4; codecs="av01.0.05M.08"'
      />
      <source src={`${BASE}-h264.mp4`} type="video/mp4" />
    </video>
  );
}
