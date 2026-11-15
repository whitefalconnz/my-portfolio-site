import { ENTRIES, type Still } from "../data/work";

/**
 * Looks up Vimeo's own thumbnail for every Vimeo piece that has no poster in
 * the data file. Runs on the server when the page is built and again about
 * once a day, never in the visitor's browser. If Vimeo can't be reached the
 * piece simply shows without a picture until it's played.
 */
export async function vimeoPosters(): Promise<Record<string, Still>> {
  const ids = new Set<string>();
  for (const entry of ENTRIES) {
    for (const section of entry.sections) {
      for (const { media } of section.pieces) {
        if (media.type === "vimeo" && !media.poster) ids.add(media.src);
      }
    }
  }

  const found = await Promise.all(
    [...ids].map(async (id): Promise<[string, Still] | null> => {
      try {
        const response = await fetch(
          `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
            `https://vimeo.com/${id}`
          )}&width=1280`,
          { signal: AbortSignal.timeout(4000), next: { revalidate: 86400 } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        const src: unknown = data.thumbnail_url;
        if (typeof src !== "string" || !src.startsWith("https://i.vimeocdn.com/")) {
          return null;
        }
        return [
          id,
          {
            src,
            w: Number(data.thumbnail_width) || 1280,
            h: Number(data.thumbnail_height) || 720,
          },
        ];
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(found.filter((item) => item !== null));
}
