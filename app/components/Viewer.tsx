"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Entry, FlatPiece, Still } from "../data/work";
import { thumb } from "../lib/img";
import { Clip, Sprite, Vimeo } from "./Media";

/**
 * A piece at full screen: the deepest level of the site. Images can be zoomed
 * right in (click, scroll or pinch) and dragged around; arrow keys and swipes
 * move through the rest of the project without leaving.
 */

type View = { s: number; x: number; y: number };
const FIT: View = { s: 1, x: 0, y: 0 };
const MAX_SCALE = 8;

function Zoomable({
  media,
  title,
  onStep,
}: {
  media: Still;
  title: string;
  onStep: (direction: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(FIT);
  const viewRef = useRef(view);
  viewRef.current = view;
  // Eased for a click-to-zoom, immediate while dragging, pinching or scrolling.
  const [eased, setEased] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    from: View;
    x: number;
    y: number;
    distance: number;
    moved: boolean;
  } | null>(null);

  const aspect = media.w / media.h;

  // The box, and the image as it sits in it when it fits.
  const measure = () => {
    const rect = boxRef.current!.getBoundingClientRect();
    const width = Math.min(rect.width, rect.height * aspect);
    return {
      rect,
      width,
      height: width / aspect,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    };
  };

  // Keeps the image from being dragged off screen.
  const clamp = (s: number, x: number, y: number): View => {
    const m = measure();
    const scale = Math.min(Math.max(s, 1), MAX_SCALE);
    if (scale === 1) return FIT;
    const maxX = Math.max(0, (m.width * scale - m.rect.width) / 2);
    const maxY = Math.max(0, (m.height * scale - m.rect.height) / 2);
    return {
      s: scale,
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  // Zooms to `s` keeping the point (px, py) of the screen where it is.
  const zoomAt = (from: View, s: number, px: number, py: number): View => {
    const m = measure();
    const scale = Math.min(Math.max(s, 1), MAX_SCALE);
    const k = scale / from.s;
    const dx = px - m.cx;
    const dy = py - m.cy;
    return clamp(scale, dx - k * (dx - from.x), dy - k * (dy - from.y));
  };

  // One click goes to the image's real size, between 2x and 4x.
  const clickScale = () => {
    const m = measure();
    return Math.min(4, Math.max(2, media.w / (m.width * devicePixelRatio)));
  };

  // Scrolling zooms. Added by hand because React's wheel listener can't stop
  // the page from scrolling.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setEased(false);
      setView((current) =>
        zoomAt(
          current,
          current.s * Math.exp(-event.deltaY * 0.002),
          event.clientX,
          event.clientY
        )
      );
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGesture = () => {
    const points = [...pointers.current.values()];
    if (points.length === 1) {
      gesture.current = {
        from: viewRef.current,
        x: points[0].x,
        y: points[0].y,
        distance: 0,
        moved: gesture.current?.moved ?? false,
      };
    } else if (points.length >= 2) {
      gesture.current = {
        from: viewRef.current,
        x: (points[0].x + points[1].x) / 2,
        y: (points[0].y + points[1].y) / 2,
        distance: Math.hypot(
          points[0].x - points[1].x,
          points[0].y - points[1].y
        ),
        moved: true,
      };
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    startGesture();
    setEased(false);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.current.values()];
    const g = gesture.current;

    if (points.length >= 2) {
      const mx = (points[0].x + points[1].x) / 2;
      const my = (points[0].y + points[1].y) / 2;
      const distance = Math.hypot(
        points[0].x - points[1].x,
        points[0].y - points[1].y
      );
      const zoomed = zoomAt(g.from, (g.from.s * distance) / g.distance, g.x, g.y);
      setView(clamp(zoomed.s, zoomed.x + (mx - g.x), zoomed.y + (my - g.y)));
      return;
    }

    const dx = points[0].x - g.x;
    const dy = points[0].y - g.y;
    if (!g.moved && Math.hypot(dx, dy) < 6) return;
    g.moved = true;
    if (g.from.s > 1) {
      setDragging(true);
      setView(clamp(g.from.s, g.from.x + dx, g.from.y + dy));
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    const point = pointers.current.get(event.pointerId);
    if (!point) return;
    pointers.current.delete(event.pointerId);
    const g = gesture.current;

    if (pointers.current.size > 0) {
      // One finger of a pinch lifted: carry on as a drag from here.
      startGesture();
      return;
    }
    gesture.current = null;
    setDragging(false);
    if (!g) return;

    if (!g.moved) {
      // A plain click or tap: zoom in on that spot, or back out.
      setEased(true);
      setView(
        viewRef.current.s > 1
          ? FIT
          : zoomAt(FIT, clickScale(), event.clientX, event.clientY)
      );
      return;
    }

    // A sideways flick on a fitted image moves to the next piece.
    const dx = event.clientX - g.x;
    const dy = event.clientY - g.y;
    if (
      g.from.s === 1 &&
      viewRef.current.s === 1 &&
      Math.abs(dx) > 60 &&
      Math.abs(dx) > Math.abs(dy) * 1.5
    ) {
      onStep(dx < 0 ? 1 : -1);
    }
  };

  // A sharper file as the zoom goes up, in whole steps so scrolling doesn't
  // ask for a new one on every notch.
  const sharpness = Math.min(4, Math.ceil(view.s));
  const fitted = Math.round(100 * Math.min(1, aspect * 0.6));

  return (
    <div
      ref={boxRef}
      className="zoom"
      data-zoomed={view.s > 1 || undefined}
      data-dragging={dragging || undefined}
      data-loading={!loaded || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="zoom-layer"
        style={{
          transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.s})`,
          transition: eased ? "transform 0.28s cubic-bezier(0.2, 0.7, 0.2, 1)" : "none",
          backgroundImage: loaded ? undefined : `url("${thumb(media)}")`,
        }}
      >
        <Image
          src={media.src}
          alt={title}
          fill
          quality={90}
          priority
          draggable={false}
          sizes={`(max-width: 699px) ${100 * sharpness}vw, ${fitted * sharpness}vw`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>
      <Sprite className="frame-sprite" />
    </div>
  );
}

export default function Viewer({
  entry,
  pieces,
  index,
  posters,
  onStep,
  onClose,
}: {
  entry: Entry;
  pieces: FlatPiece[];
  index: number;
  posters: Record<string, Still>;
  onStep: (direction: number) => void;
  onClose: () => void;
}) {
  const piece = pieces[index] ?? pieces[0];
  const { media } = piece;
  const [info, setInfo] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const many = pieces.length > 1;

  // Hold the page still behind the viewer, and hand focus back on the way out.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, []);

  return (
    <div
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
    >
      <header className="viewer-bar">
        <p className="viewer-path">
          {entry.title !== piece.title && (
            <span className="dim">{entry.title}</span>
          )}
          <span>{piece.title}</span>
        </p>
        <button ref={closeRef} type="button" className="word" onClick={onClose}>
          Close
        </button>
      </header>

      <div className="viewer-media">
        {media.type === "image" && (
          <Zoomable
            key={media.src}
            media={media}
            title={piece.title}
            onStep={onStep}
          />
        )}
        {media.type === "video" && (
          <Clip
            key={media.src}
            media={media}
            title={piece.title}
            loop={entry.kind === "loop"}
          />
        )}
        {media.type === "vimeo" && (
          <Vimeo
            key={media.src}
            media={media}
            title={piece.title}
            poster={posters[media.src]}
          />
        )}
      </div>

      <footer className="viewer-foot">
        {info && <p className="viewer-info">{piece.text}</p>}
        <p className="meta">
          {many && (
            <>
              <span>
                {index + 1} / {pieces.length}
              </span>
              <button type="button" className="word" onClick={() => onStep(-1)}>
                Previous
              </button>
              <button type="button" className="word" onClick={() => onStep(1)}>
                Next
              </button>
            </>
          )}
          <button
            type="button"
            className="word"
            aria-expanded={info}
            onClick={() => setInfo(!info)}
          >
            Info
          </button>
        </p>
      </footer>
    </div>
  );
}
