import React, { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/common/theme-provider";
import LoadingProvider from "./components/common/LoadingProvider";
import ScrollProgressBar from "./components/common/ScrollProgressBar";
import Header from "./components/layout/Header";
import { LoadingProvider as LoadingContextProvider } from "./contexts/LoadingContext";

// Re-export route metadata so Next.js can pick it up from a dedicated file
export { metadata, viewport } from "./metadata";
import { SITE_URL } from "./metadata";

// Two families only. Satoshi covers display and body (variable 300-900, so the
// heavy display weight comes free); Geist Mono covers labels and data. The old
// setup also loaded Geist Sans -- which had zero usages -- and Recoleta, which
// was a trial-licensed file, and declared Space Mono, which was never loaded.
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
  // Only used for headings inside the project modal, never at first paint, so
  // it shouldn't compete with the page's critical requests. It still loads the
  // moment the modal needs it.
  preload: false,
});

const satoshi = localFont({
  // Upright only. The italic file was preloaded on every page but no text on
  // the site is italic, so it was ~42 KB of wasted critical-path download.
  src: [
    {
      path: "./fonts/Satoshi_Complete/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

// Structured data describing who the site belongs to. Search engines use this
// for knowledge panels and to connect the site to its social profiles. Every
// fact here is taken from the site's own About page and links.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Jakob Backhouse",
      url: `${SITE_URL}/`,
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp",
      jobTitle: "Designer and Animator",
      description:
        "Wellington-based designer and animator specialising in frame-by-frame and mixed-media animation, illustration and creative advertising.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Wellington",
        addressCountry: "NZ",
      },
      worksFor: [
        { "@type": "Organization", name: "Locales" },
        { "@type": "Organization", name: "MySafetyTV/Sharpdrive" },
      ],
      knowsAbout: [
        "Frame-by-frame animation",
        "2D animation",
        "3D animation",
        "Digital illustration",
        "Storyboarding",
        "UI design",
        "Instructional design",
        "3D environment design",
        "Creative advertising",
      ],
      sameAs: [
        "https://www.instagram.com/jakobbackhouse_/",
        "https://www.linkedin.com/in/jakob-backhouse/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Jakob Backhouse",
      inLanguage: "en-NZ",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        {/* Videos, posters and the loading animation come straight from the
            media host, so open that connection early. No crossOrigin: these
            are plain <video>/<img> requests, and a CORS-mode preconnect would
            sit unused beside them. Cloudinary and Vimeo are only reached from
            inside a project, so a DNS lookup is all they need up front. */}
        <link rel="preconnect" href="https://media.jakobbackhouse.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${satoshi.variable} ${geistMono.variable} antialiased bg-ground text-ink`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingContextProvider>
            <Header />
            <ScrollProgressBar />
            <Suspense fallback={null}>
              <LoadingProvider>{children}</LoadingProvider>
            </Suspense>
          </LoadingContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
