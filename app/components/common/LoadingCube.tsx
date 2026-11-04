"use client";

import React, { useEffect, useState, useRef } from "react";
import { getCDNUrl } from "../../utils/cdn";

interface LoadingScreenProps {
  transitionState: "entering" | "visible" | "exiting";
}

// Mobile detection function
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;

  // Check for touch capability
  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Check screen size (mobile-like dimensions)
  const isMobileScreenSize = window.innerWidth <= 768;

  // Check user agent for mobile patterns
  const mobileUserAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return hasTouchScreen || isMobileScreenSize || mobileUserAgent;
};

// Performance detection
const isLowPerformanceDevice = () => {
  if (typeof window === "undefined") return false;

  // Check for low memory devices
  const memoryInfo = (navigator as any).deviceMemory;
  if (memoryInfo && memoryInfo < 4) return true; // Less than 4GB RAM

  // Check for slow connections
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === "slow-2g") return true;

  return false;
};

export default function LoadingScreen({ transitionState }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  // The device and theme are only known in the browser. Until then nothing is
  // rendered, or the server's HTML would start every visitor, phones included,
  // downloading the light video.
  const [deviceChecked, setDeviceChecked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mobile and performance detection
  useEffect(() => {
    const mobile = isMobileDevice();
    const lowPerformance = isLowPerformanceDevice();

    setIsMobile(mobile);
    setIsLowPerformance(lowPerformance);
    setDeviceChecked(true);

    // Listen for resize events to update mobile state
    const handleResize = () => {
      setIsMobile(isMobileDevice());
      setIsLowPerformance(isLowPerformanceDevice());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Debug: Log CDN URLs
  useEffect(() => {
    console.log("Dark mode:", isDarkMode);
    console.log("Is mobile:", isMobile);
    console.log("Is low performance:", isLowPerformance);
    if (!isMobile && !isLowPerformance) {
      console.log(
        "WebM URL:",
        isDarkMode
          ? "https://media.jakobbackhouse.com/Img_and_Vid/RunCycleLoadingDark.webm"
          : "https://media.jakobbackhouse.com/Img_and_Vid/RunCycleLoadingWhite.webm"
      );
    }
  }, [isDarkMode, isMobile, isLowPerformance]);

  useEffect(() => {
    if (transitionState === "visible") {
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // More realistic loading progression
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 100);
        });
      }, 150);

      return () => clearInterval(interval);
    }
  }, [transitionState]);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

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

  // Force video play on Safari mobile (only if not mobile/low performance)
  useEffect(() => {
    if (isMobile || isLowPerformance) return; // Skip video logic on mobile/low performance

    const video = videoRef.current;
    if (video && transitionState === "visible") {
      const playVideo = async () => {
        try {
          console.log("Attempting to play video:", video.src);
          await video.play();
          console.log("Video playing successfully");
        } catch (error) {
          console.log("Video autoplay failed:", error);
          setVideoError(true);
        }
      };

      // Small delay to ensure video is loaded
      setTimeout(playVideo, 100);
    }
  }, [transitionState, isDarkMode, isMobile, isLowPerformance]);

  const handleVideoError = () => {
    console.log("Video failed to load, switching to sprite fallback");
    console.log(
      "Current video sources:",
      videoRef.current?.querySelectorAll("source")
    );
    setVideoError(true);
  };

  // Determine what to show based on device capabilities
  const shouldShowVideo = !isMobile && !isLowPerformance && !videoError;

  return (
    <div
      className={`loading-screen ${transitionState} bg-ground text-ink`}
    >
      <div className="scanlines" />
      <div className="loading-content">
        <div className="running-animation">
          {!deviceChecked ? (
            // Holds the animation's space so the progress bar doesn't jump
            <div className="running-sprite" />
          ) : isMobile || isLowPerformance ? (
            // The same run cycle as an animated WebP: a fraction of the video's
            // size, and iPhone Low Power Mode can't block it the way it blocks
            // video autoplay.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                isDarkMode
                  ? "/videos/run-cycle-dark-v01.webp"
                  : "/videos/run-cycle-light-v01.webp"
              }
              alt=""
              className="running-sprite"
              style={{ imageRendering: "auto" }}
            />
          ) : // Show running character animation on desktop
          shouldShowVideo ? (
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              webkit-playsinline="true"
              className="running-sprite"
              key={isDarkMode ? "dark" : "light"} // Force re-render when theme changes
              onError={handleVideoError}
              preload="auto"
              controls={false}
            >
              {isDarkMode ? (
                <>
                  <source
                    src="https://media.jakobbackhouse.com/Img_and_Vid/RunCycleLoadingDark.webm"
                    type="video/webm"
                  />
                </>
              ) : (
                <>
                  <source
                    src="https://media.jakobbackhouse.com/Img_and_Vid/RunCycleLoadingWhite.webm"
                    type="video/webm"
                  />
                </>
              )}
              Your browser does not support the video tag.
            </video>
          ) : (
            // Fallback animated CSS sprite if video fails (desktop only)
            <div
              className="running-sprite-fallback"
              style={{
                background: isDarkMode
                  ? `url(${getCDNUrl("/Img_and_Vid/FinalDarkRunCycle_sprite.png")}) no-repeat center center`
                  : `url(${getCDNUrl("/Img_and_Vid/FinalLightRunCycle_sprite.png")}) no-repeat center center`,
                backgroundSize: "contain",
                animation: "sprite-animation 1s steps(8) infinite",
              }}
            />
          )}
        </div>

        <div className="progress-container">
          <div className="progress-wrapper">
            <div className="progress-bar-background">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="progress-bar-glow"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="loading-text text-ink">
          Now Loading
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
