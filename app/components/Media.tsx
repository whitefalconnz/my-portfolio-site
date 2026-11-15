"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { Media, Still } from "../data/work";
import { thumb } from "../lib/img";

/** The run cycle, running on the spot. Stands in for a spinner. */
export function Sprite({ className = "" }: { className?: string }) {
  return <span className={`sprite ${className}`} aria-hidden="true" />;
}

const shape = (media: { w: number; h: number }) =>
  ({ "--a": media.w / media.h }) as CSSProperties;

/**
 * How wide an image is drawn in the big view of an open project, so the
 * browser fetches a file that matches. The view is about three quarters of
 * the window on a wide screen and 16:9 at most, so a tall image is drawn much
 * narrower than the view.
 */
const stageSizes = (media: { w: number; h: number }) => {
  const a = media.w / media.h;
  const wide = Math.round(75 * Math.min(1, (a * 9) / 16));
  const narrow = Math.round(100 * Math.min(1, (a * 3) / 4));
  return `(max-width: 1023px) ${narrow}vw, ${wide}vw`;
};

/** A still picture in the big view. Clicking it opens it at full screen. */
export function StageImage({
  media,
  title,
  onView,
}: {
  media: Still;
  title: string;
  onView: () => void;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      type="button"
      className="frame frame-image"
      style={{
        ...shape(media),
        // The thumbnail is already on the page, so it shows at once and the
        // full image sharpens over it.
        backgroundImage: loaded ? undefined : `url("${thumb(media)}")`,
      }}
      data-loading={!loaded || undefined}
      onClick={onView}
      aria-label={`Enlarge ${title}`}
    >
      <Image
        src={media.src}
        alt={title}
        fill
        quality={80}
        priority
        sizes={stageSizes(media)}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      <Sprite className="frame-sprite" />
    </button>
  );
}

/**
 * A clip hosted on the site. Loops play silently by themselves; anything else
 * waits for the visitor and has the browser's own controls.
 */
export function Clip({
  media,
  title,
  loop,
}: {
  media: Extract<Media, { type: "video" }>;
  title: string;
  loop?: boolean;
}) {
  return (
    <div
      className="frame"
      style={shape(media)}
      data-paper={media.paper || undefined}
    >
      {loop ? (
        <video
          key={media.src}
          muted
          loop
          autoPlay
          playsInline
          disablePictureInPicture
          poster={media.poster?.src}
          aria-label={title}
        >
          <source
            src={`${media.src}-av1.mp4`}
            type='video/mp4; codecs="av01.0.05M.08"'
          />
          <source src={`${media.src}-h264.mp4`} type="video/mp4" />
        </video>
      ) : (
        <video
          key={media.src}
          controls
          playsInline
          preload="none"
          poster={media.poster?.src}
          aria-label={title}
        >
          <source src={media.src} type="video/webm" />
        </video>
      )}
    </div>
  );
}

/**
 * A Vimeo film. Only a still is shown until the visitor presses Play, so the
 * player (about half a megabyte) is never loaded for a film nobody watches,
 * and nothing makes a sound unannounced.
 */
export function Vimeo({
  media,
  title,
  poster,
}: {
  media: Extract<Media, { type: "vimeo" }>;
  title: string;
  poster?: Still;
}) {
  const [playing, setPlaying] = useState(false);
  const id = media.src.replace(/[^0-9]/g, "");
  const still = media.poster ?? poster;

  return (
    <div className="frame" style={shape(media)}>
      {playing ? (
        <>
          <Sprite className="frame-sprite frame-sprite-on" />
          <iframe
            src={`https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1`}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            allowFullScreen
          />
        </>
      ) : (
        <button
          type="button"
          className="play"
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
        >
          {still && (
            <Image
              src={still.src}
              alt=""
              fill
              quality={75}
              sizes="(max-width: 1023px) 100vw, 75vw"
            />
          )}
          <span className="play-word">Play</span>
        </button>
      )}
    </div>
  );
}
