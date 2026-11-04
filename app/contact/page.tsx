"use client";

import { useState, useEffect, useRef } from "react";

import GetInTouch from "../components/common/GetInTouch";
import { useAutoImageTracking } from "../hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "../components/common/MemoryStatsDebugger";

export default function ContactPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auto memory management for images on this page (though contact page has no images currently)
  const contactPageRef = useRef<HTMLDivElement>(null);
  const { trackAllElements, getStats: getContactTrackingStats } =
    useAutoImageTracking(contactPageRef, {
      enabled: true,
      debugLog: process.env.NODE_ENV === "development",
      selector: "img, video, iframe",
      trackOnMount: true,
      retryInterval: 2000,
    });

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Track elements when page loads (though contact page has minimal media)
  useEffect(() => {
    const timer = setTimeout(() => {
      trackAllElements();

      if (process.env.NODE_ENV === "development") {
        console.log(
          "📊 Contact page auto-tracking stats:",
          getContactTrackingStats()
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [trackAllElements, getContactTrackingStats]);

  return (
    <div
      ref={contactPageRef}
      className="min-h-screen bg-ground grid-pattern relative"
    >

      <main className="pt-32 md:pt-40 pb-20 max-w-6xl mx-auto px-6 md:flex md:gap-8 relative">
        <GetInTouch headingLevel="h1" />
      </main>

      {/* Memory stats debugger - development only */}
      <MemoryStatsDebugger position="top-right" />
    </div>
  );
}
