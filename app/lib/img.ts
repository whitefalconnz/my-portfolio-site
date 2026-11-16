import { getImageProps } from "next/image";
import type { Media, Still } from "../data/work";

const cache = new Map<string, string>();

/**
 * A small version of an image (256px wide), for the strip of thumbnails. The
 * big view puts the same file behind itself while the full image loads, so a
 * piece appears the moment it's picked.
 */
export function thumb(still: Still): string {
  let url = cache.get(still.src);
  if (!url) {
    // Asking for 128 returns the 2x file, which is the 256px one.
    url = getImageProps({
      src: still.src,
      width: 128,
      height: Math.round((128 * still.h) / still.w),
      quality: 60,
      alt: "",
    }).props.src;
    cache.set(still.src, url);
  }
  return url;
}

/** The picture that stands for a piece before it plays, if it has one. */
export function stillOf(media: Media, fallback?: Still): Still | undefined {
  if (media.type === "image") return media;
  return media.poster ?? fallback;
}
