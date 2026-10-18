import type { MetadataRoute } from "next";
import { SITE_URL } from "./metadata";

// The three public pages. Projects open in a modal on the home page rather
// than at their own URLs, so they have no separate entries.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];
}
