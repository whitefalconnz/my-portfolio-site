"use client";

import { useEffect, useRef } from "react";
import { useLoading } from "../../contexts/LoadingContext";

/**
 * A faint hairline across the top of the window that fills as the page is
 * scrolled. One passive scroll listener writes a single transform per frame,
 * so it never causes layout or a React render.
 */
export default function ScrollProgressBar() {
  const { isLoading } = useLoading();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const range = root.scrollHeight - root.clientHeight;
      const progress = range > 0 ? Math.min(window.scrollY / range, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="scroll-progress-bar"
      style={{ transform: "scaleX(0)", opacity: isLoading ? 0 : undefined }}
    />
  );
}
