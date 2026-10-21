import type { Metadata, Viewport } from "next";

export const SITE_URL = "https://jakobbackhouse.com";
const DESCRIPTION =
  "Portfolio of Jakob Backhouse, a Wellington-based designer and animator working in frame-by-frame and mixed-media animation, illustration and creative advertising.";

// Shared social card. The artwork is 1920x640, so it is declared at its real
// size -- it was previously declared as 1200x630, which told link previewers
// the wrong shape. Served as a JPEG from this domain because not every link
// previewer accepts WebP.
export const SOCIAL_IMAGE = {
  url: "/og-image.jpg",
  width: 1920,
  height: 640,
  alt: "Generative brush-stroke painting from Jakob Backhouse's Creative Coding project",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jakob Backhouse | Designer & Animator, Wellington NZ",
    // Pages set a short title; this frames it so every tab and search result
    // is distinct but still carries the name.
    template: "%s | Jakob Backhouse",
  },
  description: DESCRIPTION,
  applicationName: "Jakob Backhouse",
  authors: [{ name: "Jakob Backhouse", url: SITE_URL }],
  creator: "Jakob Backhouse",
  publisher: "Jakob Backhouse",
  keywords: [
    "Jakob Backhouse",
    "animator",
    "designer",
    "frame-by-frame animation",
    "2D animation",
    "3D animation",
    "illustration",
    "creative advertising",
    "motion design",
    "Wellington",
    "New Zealand",
    "portfolio",
  ],
  category: "design",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Let search show large image previews and full snippets -- this is a
      // visual portfolio, so image search and Discover matter.
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Jakob Backhouse",
    locale: "en_NZ",
    title: "Jakob Backhouse | Designer & Animator",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jakob Backhouse | Designer & Animator",
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
  // app/favicon.ico is picked up automatically by the App Router, so it is
  // not repeated here (it was being emitted twice). The PNGs live in public/.
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

// Replaces the hand-written viewport and theme-color tags in the layout's
// <head>. Next always emits its own viewport tag, so the hand-written one meant
// two conflicting viewport declarations on every page.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E10" },
  ],
};
