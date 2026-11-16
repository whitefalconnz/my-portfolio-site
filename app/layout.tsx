import React from "react";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

// Re-export route metadata so Next.js can pick it up from a dedicated file
export { metadata, viewport } from "./metadata";
import { SITE_URL } from "./metadata";

// One typeface for the whole site: Satoshi, upright, as a single variable
// file that covers every weight.
const satoshi = localFont({
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
// fact here is taken from the site's own About section and links.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Jakob Backhouse",
      url: `${SITE_URL}/`,
      image: "https://media.jakobbackhouse.com/Img_and_Vid/SmokeProfile.webp",
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

// Runs before anything is drawn, so a visitor who chose the white version
// never sees a flash of the black one. Black is the default.
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.dataset.theme="light";document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#ffffff")}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" suppressHydrationWarning>
      <head>
        {/* Artwork comes straight from the media host, so open that connection
            early. Vimeo is only reached once a film is played, so a DNS lookup
            is all it needs up front. */}
        <link rel="preconnect" href="https://media.jakobbackhouse.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={satoshi.variable}>
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
