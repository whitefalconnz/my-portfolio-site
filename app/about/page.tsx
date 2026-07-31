"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import { Badge } from "../components/ui/badge";
import FadeInImage from "../components/common/FadeInImage";
import React from "react";
import { useAutoImageTracking } from "../hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "../components/common/MemoryStatsDebugger";

export default function AboutPage() {
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
    // Theme-dependent colours now come from CSS variables, so this component no
    // longer needs to observe the class attribute to recolour itself in JS.

    // Set loaded state after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
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

  return (
    <div
      ref={aboutPageRef}
      className="min-h-screen bg-ground grid-pattern relative"
    >

      <main className="container mx-auto px-6 md:px-8 lg:px-12 mb-12 max-w-[1920px]">
        <div className="grid lg:grid-cols-12 gap-2 lg:gap-4 pt-4 lg:items-start">
          {/* Left side - Image and Skills */}
          <div className="lg:col-span-6 lg:col-start-2 space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <div
                className="relative z-10 bg-transparent p-0 inline-block"
              >
                <div
                  className="relative border hover:border-accent transition-all duration-300"
                  style={{
                    borderColor: "var(--line)",
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
              </div>
            </div>

            {/* Skills section moved under the image */}
            <div className="flex justify-center">
              <div
                className="border bg-ground p-6 md:p-8 relative z-10 w-full max-w-[720px] transition-all duration-300"
              >
                <div
                  className="flex items-center gap-2 mb-3 border-b pb-2"
                  style={{ borderBottomColor: "var(--line)" }}
                >
                  <h2 className="font-display font-medium text-lg text-accent">
                    Core Skills
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Digital Illustration",
                    "Storyboarding",
                    "UI Design",
                    "Instructional Design",
                    "3D Environment Design",
                    "After Effects Vector Animation or Toon Boom Frame by Frame Animation",
                  ].map((skill, index) => (
                    <div
                      key={skill}
                      className="border bg-ground p-2 transition-all duration-300"
                      style={{ borderColor: "var(--line)" }}
                    >
                      <span className="font-satoshi text-sm text-dark dark:text-light block text-center">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Bio and Experience */}
          <div className="lg:col-span-4 space-y-4">
            <div
              className="border bg-ground p-6 md:p-8 relative z-10 transition-all duration-300"
            >
              <h1
                className="font-display text-3xl text-accent mb-4 
                    border-b pb-2"
                style={{ borderBottomColor: "var(--line)" }}
              >
                Kia ora!
              </h1>
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
                  <a
                    href="mailto:JakobBackhouse@gmail.com"
                    className="inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-ground
                        hover:border-accent transition-all text-sm border"
                    style={{ borderColor: "var(--line)" }}
                  >
                    JakobBackhouse@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div
              className="border bg-ground p-6 md:p-8 relative z-10 transition-all duration-300"
            >
              <div
                className="flex items-center gap-2 mb-3 border-b pb-2"
                style={{ borderBottomColor: "var(--line)" }}
              >
                <h2 className="font-display font-medium text-lg text-accent">
                  Experience
                </h2>
              </div>
              <div className="space-y-3 font-satoshi">
                <div
                  className="border bg-ground p-2 transition-all duration-300"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border">
                      2021-2023
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      Learning and Motion Designer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      AXIOM Training
                    </span>
                  </div>
                </div>
                <div
                  className="border bg-ground p-2 transition-all duration-300"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border">
                      2023-Now
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      UX Designer and Website Developer
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      MySafetyTV/Sharpdrive
                    </span>
                  </div>
                </div>
                <div
                  className="border bg-ground p-2 transition-all duration-300"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className="bg-ink text-ground px-2 py-0.5 border">
                      2025-Now
                    </Badge>
                    <span className="font-bold text-dark dark:text-light">
                      Junior Designer / Technical Lead
                    </span>
                    <span className="text-secondary dark:text-secondary-light">
                      Locales
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Memory stats debugger - development only */}
      <MemoryStatsDebugger position="top-left" />
    </div>
  );
}
