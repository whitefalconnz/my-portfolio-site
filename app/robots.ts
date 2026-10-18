import type { MetadataRoute } from "next";
import { SITE_URL } from "./metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    // Everything is crawlable. In particular /_next/ must stay open: crawlers
    // need its JS and CSS to render the pages, and every image on the site is
    // served through /_next/image, so blocking it would hide the work from
    // image search.
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
