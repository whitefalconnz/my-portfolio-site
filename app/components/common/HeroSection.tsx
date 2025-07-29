"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import ScrollReveal from "../animations/ScrollReveal";
import { useHero } from "../../contexts/HeroContext";
import { useLoading } from "../../contexts/LoadingContext";

export default function HeroSection() {
  const [contentLoaded, setContentLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [showTextOverlay, setShowTextOverlay] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { showHero, setHeroHeight } = useHero();
  const { isLoading } = useLoading();

  useEffect(() => {
    // Detect Safari browser
    const detectSafari = () => {
      const userAgent = navigator.userAgent;
      const isSafariBrowser =
        /^((?!chrome|android).)*safari/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent);
      setIsSafari(isSafariBrowser);

      if (isSafariBrowser) {
        console.log("Safari detected - using Safari-optimized video loading");
      }
    };

    // Detect mobile devices
    const detectMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        ) || window.innerWidth <= 768; // Also consider small screens as mobile
      setIsMobile(isMobileDevice);

      if (isMobileDevice) {
        console.log("Mobile device detected - hiding hero section");
      }
    };

    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    // Initial checks
    detectSafari();
    detectMobile();
    checkDarkMode();
    setContentLoaded(true);

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Set up resize listener for mobile detection
    const handleResize = () => {
      detectMobile();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update hero height when component mounts/updates
  useEffect(() => {
    if (sectionRef.current) {
      const height = sectionRef.current.offsetHeight;
      setHeroHeight(height);
    }
  }, [setHeroHeight]);

  // Handle scroll indicator visibility
  useEffect(() => {
    if (!showHero) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showHero]);

  // Handle hero section click to toggle video play/pause and text overlay
  const handleHeroClick = () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        // If video is playing, pause it and show text overlay
        videoRef.current.pause();
        setShowTextOverlay(true);
      } else {
        // Safari-specific loading handling
        if (isSafari) {
          setIsVideoLoading(true);
          console.log("Safari: Starting video load process...");

          // For Safari, always load the video first to ensure it's ready
          videoRef.current.load();

          // Wait for video to be ready before playing with more robust checking
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds max wait time

          const playWhenReady = () => {
            attempts++;
            console.log(
              `Safari: Attempt ${attempts}, readyState: ${videoRef.current?.readyState}, videoCanPlay: ${videoCanPlay}`
            );

            if (videoRef.current && videoRef.current.readyState >= 2) {
              // readyState 2 = HAVE_CURRENT_DATA (enough to start playing)
              console.log("Safari: Video ready, attempting to play...");

              videoRef.current
                .play()
                .then(() => {
                  console.log("Safari: Video playing successfully");
                  setShowTextOverlay(false);
                  setIsVideoLoading(false);
                  if (isInitialLoad) {
                    setIsInitialLoad(false);
                  }
                })
                .catch((error) => {
                  console.log("Safari video play failed:", error);
                  setIsVideoLoading(false);
                  // Keep text overlay visible on error
                });
            } else if (attempts < maxAttempts) {
              // Try again after a short delay
              setTimeout(playWhenReady, 100);
            } else {
              console.log("Safari: Max attempts reached, giving up");
              setIsVideoLoading(false);
              // Keep text overlay visible
            }
          };

          // Start checking after a brief delay to let load() begin
          setTimeout(playWhenReady, 200);
        } else {
          // Non-Safari browsers - original behavior
          videoRef.current.play().catch((error) => {
            console.log("Video play failed:", error);
          });
          setShowTextOverlay(false);
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }
        }
      }
    }
  };

  // Handle sound toggle
  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the hero click
    setIsSoundOn((prev) => {
      const newSoundState = !prev;
      if (videoRef.current) {
        videoRef.current.muted = !newSoundState;
      }
      return newSoundState;
    });
  };

  // Don't render if hero shouldn't be shown, during loading, on Safari, or on mobile
  if (!showHero || isLoading || isSafari || isMobile) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      <ScrollReveal>
        <div className="relative w-full max-w-none mx-auto px-4 md:px-6 lg:px-8">
          {/* Video Container */}
          <motion.div
            className="relative border-2 cursor-pointer"
            onClick={handleHeroClick}
            initial={{
              opacity: 0,
              scale: 0.95,
              borderColor: "rgba(0, 0, 0, 0)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              borderColor: contentLoaded
                ? isDarkMode
                  ? "rgba(255, 255, 255, 1)"
                  : "rgba(0, 0, 0, 1)"
                : "rgba(0, 0, 0, 0)",
              transition: {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.8, // Wait for page transition (0.5s) + original delay (0.3s)
              },
            }}
          >
            <video
              ref={videoRef}
              muted={!isSoundOn}
              playsInline
              webkit-playsinline="true"
              className="w-full h-[90vh] object-cover"
              poster="https://media.jakobbackhouse.com/Img_and_Vid/Tag/TagThumbnailHeroSection.webp"
              preload={isSafari ? "metadata" : "none"}
              onEnded={() => {
                setShowTextOverlay(true);
                setVideoCanPlay(false);
              }}
              onLoadStart={() => {
                if (isSafari) {
                  setIsVideoLoading(true);
                }
              }}
              onCanPlay={() => {
                setVideoCanPlay(true);
                setIsVideoLoading(false);
              }}
              onLoadedData={() => {
                if (isSafari) {
                  setIsVideoLoading(false);
                }
              }}
              onError={(e) => {
                console.error("Video loading error:", e);
                setIsVideoLoading(false);
                setVideoCanPlay(false);
              }}
            >
              <source
                src="https://media.jakobbackhouse.com/Img_and_Vid/Tag/TagFullInitial.webm"
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>

            {/* Sound Toggle Button */}
            <motion.button
              onClick={handleSoundToggle}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-2 border-black dark:border-white hover:border-orange-500 hover:bg-white/90 dark:hover:bg-black/90 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.4,
                  delay: 2.0, // Appear after other elements
                },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isSoundOn ? "Turn sound off" : "Turn sound on"}
            >
              {isSoundOn ? (
                <Volume2 className="w-4 h-4 text-black dark:text-white" />
              ) : (
                <VolumeX className="w-4 h-4 text-black dark:text-white" />
              )}
            </motion.button>

            {/* Text Overlay */}
            <AnimatePresence>
              {showTextOverlay && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: isInitialLoad ? 0.6 : 0.3,
                      delay: isInitialLoad ? 1.3 : 0, // Only delay on initial load
                    },
                  }}
                  exit={{
                    opacity: 0,
                    transition: {
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  }}
                >
                  <motion.div
                    className="text-center p-6 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2"
                    initial={{
                      y: isInitialLoad ? 20 : 0,
                      opacity: 0,
                      borderColor: "rgba(0, 0, 0, 0)",
                    }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      borderColor: contentLoaded
                        ? isDarkMode
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(0, 0, 0, 1)"
                        : "rgba(0, 0, 0, 0)",
                      transition: {
                        duration: isInitialLoad ? 0.6 : 0.2,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: isInitialLoad ? 1.5 : 0, // Only delay on initial load
                      },
                    }}
                    exit={{
                      y: -10,
                      opacity: 0,
                      scale: 0.95,
                      transition: {
                        duration: 0.4,
                        ease: "easeOut",
                      },
                    }}
                  >
                    <h1 className="font-recoleta text-2xl md:text-4xl lg:text-5xl text-primary dark:text-primary-light mb-2">
                      Welcome to my portfolio
                    </h1>
                    {isVideoLoading && isSafari ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary dark:border-primary-light border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-satoshi text-sm md:text-base text-secondary dark:text-secondary-light">
                          Loading video...
                        </p>
                      </div>
                    ) : (
                      <p className="font-satoshi text-sm md:text-base text-secondary dark:text-secondary-light">
                        <span className="block md:hidden">Tap to play</span>
                        <span className="hidden md:block">Click to play</span>
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </ScrollReveal>

      {/* Scroll indicator */}
      <AnimatePresence>
        {showScrollIndicator && (
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 0.7,
              y: 0,
              transition: {
                duration: 0.6,
                delay: 2.0, // Wait for page transition (0.5s) + original delay (1.5s)
              },
            }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
          >
            <motion.div
              className="w-6 h-10 border-2 rounded-full flex justify-center"
              initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
              animate={{
                borderColor: contentLoaded
                  ? isDarkMode
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.7)"
                  : "rgba(0, 0, 0, 0)",
                transition: { delay: 2.0, duration: 0.5 }, // Wait for page transition (0.5s) + original delay (1.5s)
              }}
            >
              <motion.div
                className="w-1 h-3 bg-black dark:bg-white rounded-full mt-2"
                animate={{
                  y: [0, 12, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
