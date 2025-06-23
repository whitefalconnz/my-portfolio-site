import type { Metadata } from "next";
import React, { Suspense } from 'react';
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "./components/common/theme-provider"
import LoadingProvider from "./components/common/LoadingProvider"
import ScrollProgressBar from "./components/common/ScrollProgressBar"
import { metadata } from './metadata'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://player.vimeo.com/api/player.js" async></script>
      </head>
      <body className={`${geistSans.variable} antialiased bg-white text-black dark:bg-[#1A1818] dark:text-white`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollProgressBar />
          <Suspense fallback={null}>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
