import React, { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/common/theme-provider";
import LoadingProvider from "./components/common/LoadingProvider";
import ScrollProgressBar from "./components/common/ScrollProgressBar";
import HeroSection from "./components/common/HeroSection";
import Header from "./components/layout/Header";
import { HeroProvider } from "./contexts/HeroContext";
import { LoadingProvider as LoadingContextProvider } from "./contexts/LoadingContext";
import ScrollbarManager from "./components/common/ScrollbarManager";

// Re-export route metadata so Next.js can pick it up from a dedicated file
export { metadata } from "./metadata";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi_Complete/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi_Complete/Satoshi_Complete/Fonts/WEB/fonts/Satoshi-VariableItalic.woff2",
      weight: "300 900",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const recoleta = localFont({
  src: "./fonts/recoleta/Recoleta-RegularDEMO.otf",
  variable: "--font-recoleta",
  weight: "400",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance: DNS preconnects for external media/CDN/providers */}
        <link
          rel="preconnect"
          href="https://media.jakobbackhouse.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://player.vimeo.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://i.vimeocdn.com"
          crossOrigin="anonymous"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Theme colors for light/dark */}
        <meta
          name="theme-color"
          content="#F3F1E9"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#1A1818"
          media="(prefers-color-scheme: dark)"
        />
        {/* Defer Vimeo API load; Next will dedupe where also loaded */}
        <script src="https://player.vimeo.com/api/player.js" defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${satoshi.variable} ${recoleta.variable} antialiased bg-white text-black dark:bg-[#1A1818] dark:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingContextProvider>
            <ScrollbarManager />
            <HeroProvider>
              <Header />
              <HeroSection />
              <ScrollProgressBar />
              <Suspense fallback={null}>
                <LoadingProvider>{children}</LoadingProvider>
              </Suspense>
            </HeroProvider>
          </LoadingContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
