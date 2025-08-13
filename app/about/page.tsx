"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import { Mail, Briefcase, Palette } from "lucide-react";
import { Badge } from "../components/ui/badge";
import BackgroundSprites from "../components/animations/BackgroundSprites";
import { motion } from "framer-motion";
import FadeInImage from "../components/common/FadeInImage";
import React from "react";
import ScrollReveal from "../components/animations/ScrollReveal";
import IntroSection from "../components/common/IntroSection";
import { useAutoImageTracking } from "../hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "../components/common/MemoryStatsDebugger";

export default function AboutPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Auto memory management for images on this page
  const aboutPageRef = useRef<HTMLDivElement>(null);
  const { trackAllElements, getStats: getAboutTrackingStats } =
    useAutoImageTracking(aboutPageRef, {
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

    // Set loaded state after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Track elements when page loads
  useEffect(() => {
    if (isLoaded) {
      const timer = setTimeout(() => {
        trackAllElements();

        if (process.env.NODE_ENV === "development") {
          console.log(
            "📊 About page auto-tracking stats:",
            getAboutTrackingStats()
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, trackAllElements, getAboutTrackingStats]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1], // cubicBezier easing
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div
      ref={aboutPageRef}
      className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern relative"
    >
      {/* Background Sprites */}
      <BackgroundSprites />

      <main className="container mx-auto px-6 md:px-8 lg:px-12 mb-12 max-w-[1920px]">
        <div className="grid lg:grid-cols-12 gap-2 lg:gap-4 pt-4 lg:items-start">
          {/* Left side - Image and Skills */}
          <div className="lg:col-span-6 lg:col-start-2 space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <motion.div
                className="relative z-10 bg-transparent p-0 inline-block"
                initial={{
                  opacity: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
              >
                <div
                  className="relative border-2 hover:border-orange-500 transition-all duration-300"
                  style={{
                    borderColor: isLoaded
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(0, 0, 0, 1)"
                      : "rgba(0, 0, 0, 0)",
                  }}
                >
                  <FadeInImage
                    src="https://media.jakobbackhouse.com/Img_and_Vid/WebsitePortfolio.webp"
                    alt="Decorative illustration"
                    width={720}
                    height={540}
                    priority={false}
                    className="block max-w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>

            {/* Skills section moved under the image */}
            <div className="flex justify-center">
              <motion.div
                variants={item}
                className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-6 md:p-8 relative z-10 w-full max-w-[720px] transition-all duration-300"
                initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
                animate={{
                  borderColor: isLoaded
                    ? isDarkMode
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(0, 0, 0, 1)"
                    : "rgba(0, 0, 0, 0)",
                  transition: { delay: 0.5, duration: 0.5 },
                }}
                whileHover={{
                  borderColor: "#f97316",
                  transition: { duration: 0.3 },
                }}
              >
                <motion.div
                  className="flex items-center gap-2 mb-3 border-b pb-2"
                  initial={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                  style={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                  animate={{
                    borderBottomColor: isLoaded
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.1)"
                      : "rgba(0, 0, 0, 0)",
                    transition: { delay: 0.6, duration: 0.5 },
                  }}
                >
                  <Palette className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  <h2 className="font-recoleta font-medium text-lg text-orange-500">
                    Core Skills
                  </h2>
                </motion.div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Digital Illustration",
                    "Storyboarding",
                    "UI Design",
                    "Instructional Design",
                    "3D Environment Design",
                    "After Effects Vector Animation or Toon Boom Frame by Frame Animation",
                  ].map((skill, index) => (
                    <motion.div
                      key={skill}
                      className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                      initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
                      style={{ borderColor: "rgba(0, 0, 0, 0)" }}
                      animate={{
                        borderColor: isLoaded
                          ? isDarkMode
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(0, 0, 0, 1)"
                          : "rgba(0, 0, 0, 0)",
                        transition: { delay: 0.7 + index * 0.1, duration: 0.5 },
                      }}
                      whileHover={{
                        borderColor: "#f97316",
                        transition: { duration: 0.3 },
                      }}
                    >
                      <span className="font-satoshi text-sm text-dark dark:text-light block text-center">
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right side - Bio and Experience */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div
              className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-6 md:p-8 relative z-10 transition-all duration-300"
              initial={{
                opacity: 0,
                y: 0,
                borderColor: "rgba(0, 0, 0, 0)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                borderColor: isLoaded
                  ? isDarkMode
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(0, 0, 0, 1)"
                  : "rgba(0, 0, 0, 0)",
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                },
              }}
              whileHover={{
                borderColor: "#f97316",
                transition: { duration: 0.3 },
              }}
            >
              <motion.h1
                className="font-recoleta text-3xl text-orange-500 mb-4 
                    border-b pb-2"
                initial={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                style={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                animate={{
                  borderBottomColor: isLoaded
                    ? isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)"
                    : "rgba(0, 0, 0, 0)",
                  transition: { delay: 0.4, duration: 0.5 },
                }}
              >
                Kia ora!
              </motion.h1>
              <div className="space-y-3 font-satoshi">
                <p className="text-sm leading-relaxed text-dark/70 dark:text-light/70">
                  My name is Jakob
                  <span className="text-primary/90 dark:text-primary-light/90"></span>
                  , I am a Wellington-based designer and animator based in Mount
                  Victoria near the beach (freezing ocean dives are the best way
                  to refresh my mind).
                </p>
                <p className="text-sm leading-relaxed text-secondary/60 dark:text-secondary-light/60">
                  <br></br>For the past four years, I've been immersed in the
                  design industry, I specialise in crafting boutique frame by
                  frame and mixed media (Blender & vector) explainer video
                  animation. Although I have wide range of knowledge working
                  with clients to make websites, graphic design and 3D
                  animation.
                  <br></br>
                  <br></br>Recently I have been involved in a startup where I
                  built extensive content, from our core educational animations
                  to the website and its SEO, helping scale it from concept to
                  our first customers. Alongside this time, I've developed a
                  frame by frame animated short film, a passion I continue to
                  nurture.
                  <br></br>
                  <br></br>Artistically, I am inspired by animation masters like
                  Satoshi Kon and Masaaki Yuasa but in design I'm driven to
                  blend my artistic vision with human centred design, creating
                  work that's both distinctive and empathetic.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <motion.a
                    href="mailto:JakobBackhouse@gmail.com"
                    className="inline-flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 text-black
                        hover:border-orange-500 transition-all text-sm border-2"
                    initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
                    style={{ borderColor: "rgba(0, 0, 0, 0)" }}
                    animate={{
                      borderColor: isLoaded
                        ? isDarkMode
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(0, 0, 0, 1)"
                        : "rgba(0, 0, 0, 0)",
                      transition: { delay: 0.5, duration: 0.5 },
                    }}
                  >
                    <Mail className="h-4 w-4" />
                    JakobBackhouse@gmail.com
                  </motion.a>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-6 md:p-8 relative z-10 transition-all duration-300"
              initial={{
                opacity: 0,
                y: 0,
                borderColor: "rgba(0, 0, 0, 0)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                borderColor: isLoaded
                  ? isDarkMode
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(0, 0, 0, 1)"
                  : "rgba(0, 0, 0, 0)",
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.2,
                },
              }}
              whileHover={{
                borderColor: "#f97316",
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                className="flex items-center gap-2 mb-3 border-b pb-2"
                initial={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                style={{ borderBottomColor: "rgba(0, 0, 0, 0)" }}
                animate={{
                  borderBottomColor: isLoaded
                    ? isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)"
                    : "rgba(0, 0, 0, 0)",
                  transition: { delay: 0.5, duration: 0.5 },
                }}
              >
                <Briefcase className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                <h2 className="font-recoleta font-medium text-lg text-orange-500">
                  Experience
                </h2>
              </motion.div>
              <div className="space-y-3 font-satoshi">
                <motion.div
                  className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                  initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
                  style={{ borderColor: "rgba(0, 0, 0, 0)" }}
                  animate={{
                    borderColor: isLoaded
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(0, 0, 0, 1)"
                      : "rgba(0, 0, 0, 0)",
                    transition: { delay: 0.6, duration: 0.5 },
                  }}
                  whileHover={{
                    borderColor: "#f97316",
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-[#FFFFFF] text-black px-2 py-0.5 border-2">
                      2021-2023
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      Learning and Motion Designer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      AXIOM Training
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                  initial={{ borderColor: "rgba(0, 0, 0, 0)" }}
                  style={{ borderColor: "rgba(0, 0, 0, 0)" }}
                  animate={{
                    borderColor: isLoaded
                      ? isDarkMode
                        ? "rgba(255, 255, 255, 1)"
                        : "rgba(0, 0, 0, 1)"
                      : "rgba(0, 0, 0, 0)",
                    transition: { delay: 0.7, duration: 0.5 },
                  }}
                  whileHover={{
                    borderColor: "#f97316",
                    transition: { duration: 0.3 },
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-[#FFFFFF] text-black px-2 py-0.5 border-2">
                      2023-Now
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      UX Designer and Website Developer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      MySafetyTV/Sharpdrive
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Memory stats debugger - development only */}
      <MemoryStatsDebugger position="top-left" />
    </div>
  );
}
