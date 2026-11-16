"use client";

import { useEffect, useRef } from "react";

/**
 * The run cycle from the old loading screen, now a small companion along the
 * bottom edge. He shows how far through the page you are (or how far through
 * a project, at full screen): scroll and he runs to keep up, scroll back and
 * he turns round, and his stride always matches the ground he covers. He
 * stands still when nothing moves, steps out of the way of
 * whatever you're looking at, and clicking him goes back to the start.
 *
 * Only his position changes while he runs, and only while he's running, so he
 * costs nothing when the page is at rest.
 */
export default function Runner({
  place,
  onHome,
}: {
  // How far along he should be, 0 to 1, when something other than the page's
  // scroll decides it. `null` means follow the scroll.
  place: number | null;
  onHome: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const placeRef = useRef(place);
  placeRef.current = place;
  const update = useRef(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Starts just off the left edge, so the first thing he does is run on.
    let x = -(el.offsetLeft + el.offsetWidth);
    let target = 0;
    let frame = 0;
    let last = 0;
    let hide: ReturnType<typeof setTimeout>;

    // His legs follow the ground he covers, not the clock: the eleven
    // drawings of one full stride are spread over a fixed distance, so he
    // runs fast when the page moves fast, slows as it slows, and never
    // slides. One stride is about two and a half times his height.
    const sprite = el.firstElementChild as HTMLElement;
    const FRAMES = 11;
    let covered = 0;
    let shown = -1;
    const draw = () => {
      const stride = sprite.offsetHeight * 2.5;
      const drawing = Math.floor((covered / stride) * FRAMES) % FRAMES;
      if (drawing === shown) return;
      shown = drawing;
      sprite.style.backgroundPositionX = `${-drawing * sprite.offsetWidth}px`;
    };

    const scrollRoom = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const progress = () => {
      if (placeRef.current !== null) return placeRef.current;
      const room = scrollRoom();
      return room > 4 ? Math.min(1, Math.max(0, window.scrollY / room)) : 0;
    };

    // He stays in view only where there's a gap kept for him: on a page that
    // fits the window. Anywhere else he'd be standing on the work.
    const mayRest = () => placeRef.current === null && scrollRoom() <= 4;

    const settle = () => {
      el.removeAttribute("data-running");
      clearTimeout(hide);
      hide = setTimeout(() => {
        if (!mayRest()) el.setAttribute("data-away", "");
      }, 1200);
    };

    const tick = (now: number) => {
      frame = 0;
      const distance = target - x;
      if (still || Math.abs(distance) < 0.75) {
        x = target;
        el.style.transform = `translate3d(${x}px, 0, 0)`;
        settle();
        return;
      }
      // Faster the further behind he is, in pixels per millisecond, up to a
      // sprint his legs can still be seen making. After a long fast scroll he
      // takes a moment to catch up rather than blurring across.
      const elapsed = Math.min(40, last ? now - last : 16);
      last = now;
      const speed = Math.min(Math.max(Math.abs(distance) * 0.008, 0.12), 1.2);
      const moved = Math.min(Math.abs(distance), speed * elapsed);
      x += Math.sign(distance) * moved;
      covered += moved;
      draw();
      el.style.transform = `translate3d(${x}px, 0, 0)`;
      el.setAttribute("data-running", "");
      el.toggleAttribute("data-back", distance < 0);
      el.removeAttribute("data-away");
      frame = requestAnimationFrame(tick);
    };

    update.current = () => {
      const room = window.innerWidth - el.offsetWidth - el.offsetLeft * 2;
      target = progress() * Math.max(0, room);
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };

    const onChange = () => update.current();
    onChange();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    // The page grows and shrinks as things unfold.
    const observer = new ResizeObserver(onChange);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hide);
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    update.current();
  }, [place]);

  return (
    <button
      ref={ref}
      type="button"
      className="runner"
      onClick={onHome}
      aria-label="Back to the start"
      title="Back to the start"
    >
      <span className="sprite" aria-hidden="true" />
    </button>
  );
}
