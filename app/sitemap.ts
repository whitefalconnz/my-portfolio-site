import type { MetadataRoute } from "next";
import { SITE_URL } from "./metadata";

// The site is a single page. Projects, about and contact unfold on it rather
// than living at their own addresses, so there is one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
