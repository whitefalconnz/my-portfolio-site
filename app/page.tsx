"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { Instagram, Linkedin, Twitter, RotateCcw } from "lucide-react";
import ProjectModal from "./components/project/ProjectModal";
import "./grid.css";
import Header from "./components/layout/Header";
import { AspectRatio, type Project } from "./types/project";
import "./styles/grid.css";
import { getImageDimensions } from "./utils/imageUtils";
import SparkEffect from "./components/animations/SparkEffect";
import ScrollReveal from "./components/animations/ScrollReveal";
import BackgroundSprites from "./components/animations/BackgroundSprites";
import AnimatedText from "./utils/AnimatedText";
import Masonry from "react-masonry-css";
import { getCDNUrl, getOptimizedImageUrl } from "./utils/cdn";
import {
  clearHomePageMedia,
  restoreHomePageMedia,
  logMemoryUsage,
} from "./utils/memoryManager";
import { useHero } from "./contexts/HeroContext";
import FadeInImage from "./components/common/FadeInImage";
import { motion } from "framer-motion";
import { useAutoImageTracking } from "./hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "./components/common/MemoryStatsDebugger";

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Debug selected project state
  useEffect(() => {
    console.log("🔍 selectedProject state changed:", {
      selectedProject,
      shouldRenderModal: !!selectedProject,
      projectFound: selectedProject
        ? !!projects.find((p) => p.id === selectedProject)
        : null,
    });
  }, [selectedProject]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>([]);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const showreelLoaded = useRef(false);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Auto memory management for images on this page
  const { trackAllElements, getStats: getAutoTrackingStats } =
    useAutoImageTracking(pageContainerRef, {
      enabled: true,
      debugLog: process.env.NODE_ENV === "development",
      selector: "img, video, iframe:not([src*='vimeo.com'])", // Exclude Vimeo iframes from auto memory management
      trackOnMount: true,
      retryInterval: 2000, // Check for new images every 2 seconds
    });

  // Cleanup memory on component unmount
  useEffect(() => {
    return () => {
      // Restore media if component unmounts while modal is open
      restoreHomePageMedia();
    };
  }, []);

  // Track elements when content loads or project list changes
  useEffect(() => {
    if (contentLoaded && randomizedProjects.length > 0) {
      // Delay tracking to ensure DOM is ready
      const timer = setTimeout(() => {
        trackAllElements();

        if (process.env.NODE_ENV === "development") {
          console.log(
            "📊 Auto-tracking stats after content load:",
            getAutoTrackingStats()
          );
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    contentLoaded,
    randomizedProjects.length,
    trackAllElements,
    getAutoTrackingStats,
  ]);
  // Social meta tags are now defined in `app/metadata.ts`

  // Re-track elements when filter changes (some images become visible/hidden)
  useEffect(() => {
    if (contentLoaded) {
      const timer = setTimeout(() => {
        trackAllElements();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedCategories, contentLoaded, trackAllElements]);

  // Add state for collapsible categories
  const [showFilters, setShowFilters] = useState(false);

  // Add state for filter button visibility based on scroll
  const [showFilterButton, setShowFilterButton] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Hero context
  const { showHero, heroHeight } = useHero();

  // Tooltip state for illustration
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Detect Safari browser
    const detectSafari = () => {
      const userAgent = navigator.userAgent;
      const isSafariBrowser =
        /^((?!chrome|android).)*safari/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent);
      setIsSafari(isSafariBrowser);

      if (isSafariBrowser) {
        console.log("Safari detected - optimizing for memory usage");
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
        console.log("Mobile device detected - optimizing for performance");
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

    // Cleanup
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Add scroll listener to show filter button when past featured section
  useEffect(() => {
    const handleScroll = () => {
      // Show filter button when user scrolls past the featured section
      // We'll use a scroll position threshold instead of element detection for better performance
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Show button when scrolled past approximately where featured section ends
      // This is roughly after hero section + featured section (estimated ~1200px)
      setShowFilterButton(scrollY > viewportHeight * 1.2);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reset positions function
  const resetPositions = () => {
    // Function kept for compatibility but emptied since drag functionality was removed
  };

  // Track when any element is dragged
  const onDragEnd = () => {
    // Function kept for compatibility but emptied since drag functionality was removed
  };

  // Enhanced mobile-friendly click handler
  const handleProjectClick = (
    projectId: string,
    event?: React.MouseEvent | React.TouchEvent
  ) => {
    console.log("🔥 handleProjectClick called:", {
      projectId,
      selectedProject,
      currentTime: new Date().toISOString(),
      eventType: event?.type,
    });

    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("✅ About to call setSelectedProject with:", projectId);

    // Add a small delay to ensure state updates properly on mobile
    requestAnimationFrame(() => {
      // Log memory usage before clearing
      logMemoryUsage("Before modal open");

      // Clear home page media to reduce memory usage
      clearHomePageMedia();

      // Log memory usage after clearing
      setTimeout(() => logMemoryUsage("After media cleared"), 100);

      setSelectedProject(projectId);
      console.log("✅ setSelectedProject called successfully");
    });
  };

  // FIX: Enhanced mobile-optimized touch handlers for better modal interaction
  const handleTouchStart = (projectId: string) => (event: React.TouchEvent) => {
    if (process.env.NODE_ENV === "development") {
      console.log("📱 Touch start on project:", projectId);
    }

    // FIX: Prevent any potential interference with modal opening
    event.stopPropagation();

    // Store the initial touch to compare with touchend
    const touch = event.touches[0];
    (event.currentTarget as any).initialTouch = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (projectId: string) => (event: React.TouchEvent) => {
    if (process.env.NODE_ENV === "development") {
      console.log("📱 Touch end on project:", projectId);
    }

    // FIX: Prevent any potential interference with modal opening
    event.stopPropagation();
    event.preventDefault();

    const element = event.currentTarget as any;
    const initialTouch = element.initialTouch;

    if (!initialTouch) {
      if (process.env.NODE_ENV === "development") {
        console.log("📱 No initial touch found, treating as click");
      }
      handleProjectClick(projectId, event);
      return;
    }

    const changedTouch = event.changedTouches[0];
    const deltaX = Math.abs(changedTouch.clientX - initialTouch.x);
    const deltaY = Math.abs(changedTouch.clientY - initialTouch.y);
    const deltaTime = Date.now() - initialTouch.time;

    // FIX: More lenient tap detection for mobile users
    const isTap = deltaX < 15 && deltaY < 15 && deltaTime < 750;

    if (process.env.NODE_ENV === "development") {
      console.log("📱 Touch analysis:", {
        deltaX,
        deltaY,
        deltaTime,
        isTap,
      });
    }

    if (isTap) {
      handleProjectClick(projectId, event);
    }

    // Clean up
    delete element.initialTouch;
  };

  const categories = ["Animation", "Creative Advertising", "Illustration"];

  // Safe toggle category handler that prevents clicks during/after drag
  const handleToggleCategory = (category: string) => {
    // Save current window scroll position
    const scrollPosition = window.scrollY;

    // Add filtering class for smooth transition
    const masonryElement = document.querySelector(".project-masonry");
    if (masonryElement) {
      masonryElement.classList.add("filtering");
    }

    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

    // Reset loading states for newly visible projects
    setTimeout(() => {
      setLoadingItems((prev) => {
        const newLoadingStates = { ...prev };
        filteredProjects.forEach((project) => {
          // Only reset if the project wasn't already visible
          if (!prev.hasOwnProperty(project.id)) {
            newLoadingStates[project.id] = true;
          }
        });
        return newLoadingStates;
      });
    }, 10);

    // Restore window scroll position and remove filtering class after state update
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: "auto", // Use 'auto' instead of 'smooth' to prevent visible scrolling
      });

      if (masonryElement) {
        masonryElement.classList.remove("filtering");
      }
    }, 50); // Slight delay to ensure smooth transition
  };

  // Replace the original toggleCategory function with our safe version
  const toggleCategory = handleToggleCategory;

  const projects: Project[] = [
    // Animation Projects - Featured First
    {
      id: "Tag",
      title: "Tag",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/TagPoster1.webp",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description:
        "Inspired by a personal moment of fever-induced terror, this narrative follows a child's game of tag with monsters as it spirals into a terrifying chase, climaxing in a moment of imagined injury. The work uses frame-by-frame animation, distorted backgrounds, abstract shapes, and unsettlingly childish monsters to convey how panic overwhelms logic. A subtle 'rubber hose' aesthetic makes reality feel unstable, while environments inspired by Wellington, NZ, serve as a metaphor for panic's uncontrollable force versus the struggle for control. The film acts as a window into this state for those unfamiliar, and as a source of comfort for those who have experienced it. It depicts emotional extremes where survival instinct overrides reason. The completed trailer will be used to promote the full short film, attract collaborators for sound design, and target film festivals like NZIFF and Show Me Shorts, building an audience and network for the project.",
      categories: ["Animation"],
    },
    // Paintings and Illustrations
    {
      id: "Illustrations",
      title: "Illustrations & Paintings",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/PersonalPaintings/SaddleRoadQuickSketch.webp",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description:
        "A collection of digital paintings, illustrations, and traditional artworks exploring various themes and techniques.",
      categories: ["Illustration"],
    },
    // Creative Advertising Projects
    {
      id: "Creative Advertising",
      title: "Tales from the Sun",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/TalesFromTheSun/Storyboard_TalesFromTheSun.webp",
      aspectRatio: AspectRatio.LANDSCAPE,
      bgColor: "bg-[#5C3E3C]",
      description:
        "A small team and I were tasked with creating a campaign to spread awareness about sun safety in New Zealand. We developed a campaign that used cheesy and grotesque horror tropes to convince people to be more sun safe.",
      categories: ["Creative Advertising"],
    },
    {
      id: "BumbleGanttWithTheWind",
      title: "Bumble ICK Campaign",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/GanttWithTheWind/Storyboard_BumbleICK%20(2).webp",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description:
        "A mock collaboration with Bumble addressing how Gen Z develop 'ICKs' as an excuse for human imperfections, promoting the app as a safe platform for vulnerability.",
      categories: ["Creative Advertising"],
    },
    {
      id: "SmokeAnimation",
      title: "Smoke Animation",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/SmokePreview.webm",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description:
        "A personal film about addiction made in Blender Grease Pencil. Exploring the feeling of withdrawing from an addiction, my character makes his way through a journey on a train, from irritation and panic to eventual recovery. A bear intermittently comes into view, tempting the character to smoke. People crowd the train, and the character plunges into a panic where he almost loses his sanity, only to barely resist smoking as the train comes out of the tunnel.",
      categories: ["Animation"],
    },
    {
      id: "MySafetyTV",
      title: "MySafetyTV",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/MySafetyTVThumbnail.webm",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description:
        "I worked for an online safety training company called MySafetyTV. One other person and I were tasked with creating the animated explainer videos for the company. There was a 2–4 week turnaround for each video from concept to execution. These videos are part of a learning course that my co-worker and I created.",
      categories: ["Animation", "Creative Advertising"],
    },
    // Update Creative Coding project
    {
      id: "CreativeCoding",
      title: "Creative Coding",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_1.webp",
      aspectRatio: AspectRatio.SQUARE,
      bgColor: "bg-[#5C3E3C]",
      description:
        "How can I create an image manipulator in p5.js that can turn any photo into a painting? What type of images and style should I use to convey the feeling of going for bush walks when I was younger? To create this effect, I thought about how paintings are made and what makes them look like paintings. The primary reason is the effect of using a brush, so the focus of the project was creating the effect of brush strokes in the slightly random but logical way that a painter would create them.",
      categories: ["Illustration"],
    },
    {
      id: "Truckmate",
      title: "Truckmate",
      image:
        "https://media.jakobbackhouse.com/Img_and_Vid/TruckMate/Jakob_Backhouse_BMDR16_Animated-Logo.webm",
      aspectRatio: AspectRatio.LANDSCAPE,
      bgColor: "bg-[#2C4B7A]",
      description:
        "Within a month, I went through a design sprint using the human-centred design process: observing and empathising with my environment, identifying a problem, and then iteratively finding a design solution. In my local area, I noticed there were truck communication and congestion issues, often with three pizza stores and many other fast food outlets in very close proximity to each other in a confusing area to access. After interviewing truck drivers and conducting market research, I found that most truck drivers used Google Maps, which does not provide the essential information they need.",
      categories: ["Animation", "Creative Advertising"],
    },
  ];

  const getStoredProjects = () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("projectOrder");
    return stored ? JSON.parse(stored) : [];
  };

  const shuffleArray = (array: Project[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    // Immediately set randomizedProjects from localStorage if available
    // This allows the UI to render with cached project order while images load
    const storedProjects = getStoredProjects();

    // Add version check to force refresh when project data changes
    const dataVersion = "1.0"; // Increment this when making changes to project data
    const storedVersion = localStorage.getItem("projectDataVersion");

    if (
      storedProjects.length === projects.length &&
      storedVersion === dataVersion
    ) {
      setRandomizedProjects(storedProjects);
      // Show content immediately if we have stored projects
      setContentLoaded(true);
    } else {
      // Clear existing data and store new version
      const newRandomized = shuffleArray(projects);
      setRandomizedProjects(newRandomized);
      localStorage.setItem("projectOrder", JSON.stringify(newRandomized));
      localStorage.setItem("projectDataVersion", dataVersion);
      // Show content after a short delay for first-time visitors
      setTimeout(() => setContentLoaded(true), 300);
    }

    // Initialize loading states for all projects
    const initialLoadingStates: Record<string, boolean> = {};
    projects.forEach((project) => {
      initialLoadingStates[project.id] = true;
    });
    setLoadingItems(initialLoadingStates);

    // Set a timeout to ensure we show content even if images are slow to load
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Maximum loading time before showing content anyway

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    const loadImageDimensions = async () => {
      let loadedCount = 0;
      const totalImages = projects.length;
      const dimensions: Record<string, { width: number; height: number }> = {};

      // Create an array of promises to load all images in parallel
      const loadPromises = projects.map(async (project) => {
        try {
          if (!project.image) {
            dimensions[project.id] = { width: 400, height: 300 };
            loadedCount++;
            return;
          }

          // Set initial dimensions based on type
          dimensions[project.id] =
            project.image.endsWith(".webm") || project.image.endsWith(".mp4")
              ? { width: 1920, height: 1080 } // Default video dimensions
              : { width: 400, height: 300 }; // Default image dimensions

          // Try to get actual dimensions
          const actualDimensions = await getImageDimensions(project.image);
          dimensions[project.id] = actualDimensions;

          loadedCount++;
          // If we've loaded enough images to show a decent UI, remove loading state
          if (loadedCount > totalImages * 0.5 && isLoading) {
            setIsLoading(false);
          }
        } catch (error) {
          console.warn(`Using default dimensions for ${project.id}`);
          loadedCount++;
          // Keep using the initial dimensions set above
        }
      });

      // Wait for all images to load in parallel
      await Promise.all(loadPromises);

      setImageDimensions(dimensions);
      setIsLoading(false);
    };

    if (contentLoaded) {
      loadImageDimensions();
    }
  }, [projects, contentLoaded, isLoading]);

  const getGridSpan = (project: Project) => {
    const imageRatio =
      imageDimensions[project.id]?.width /
        imageDimensions[project.id]?.height || 1;

    if (imageRatio > 1.7) {
      // Very wide images (panorama)
      return { cols: 4, rows: 3 };
    } else if (imageRatio > 1.3) {
      // Landscape
      return { cols: 3, rows: 3 };
    } else if (imageRatio > 0.8 && imageRatio < 1.2) {
      // Square-ish
      return { cols: 2, rows: 3 };
    } else if (imageRatio < 0.6) {
      // Very tall
      return { cols: 2, rows: 4 };
    } else {
      // Portrait
      return { cols: 2, rows: 4 };
    }
  };

  const filteredProjects = randomizedProjects.filter((project: Project) => {
    if (selectedCategories.length === 0) return true;
    return project.categories.some((category: string) =>
      selectedCategories.includes(category)
    );
  });

  const currentProjectIndex = selectedProject
    ? filteredProjects.findIndex((p) => p.id === selectedProject)
    : -1;

  const handleNext = () => {
    if (currentProjectIndex < filteredProjects.length - 1) {
      setSelectedProject(filteredProjects[currentProjectIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentProjectIndex > 0) {
      setSelectedProject(filteredProjects[currentProjectIndex - 1].id);
    }
  };

  // Add skeleton array for the loading state
  const skeletonProjects = useMemo(
    () =>
      Array(9)
        .fill(0)
        .map((_, i) => i),
    []
  );

  // Development utility - add to console for testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).resetIntro = () => {
        // localStorage.removeItem('hasSeenIntro');
        // window.location.reload();
      };
    }
  }, []);

  // Function to handle individual item loading completion
  const handleItemLoaded = (projectId: string) => {
    setLoadingItems((prev) => ({
      ...prev,
      [projectId]: false,
    }));
  };

  // Function to get poster image for video projects - using project-based mapping
  const getVideoPosterImage = (project: Project) => {
    // Map each project to a reliable static image
    const projectPosterMap: Record<string, string> = {
      SmokeAnimation:
        "https://media.jakobbackhouse.com/Img_and_Vid/Smoke/SmokeThumbnail(Safari).webp", // Use illustration as fallback
      MySafetyTV:
        "https://media.jakobbackhouse.com/Img_and_Vid/MySafetyTV/MySafetyTVThumbnail(Safari).webp", // Use Tag poster as fallback
      Truckmate:
        "https://media.jakobbackhouse.com/Img_and_Vid/TruckMate/TruckMateThumbnail(Safari).webp", // Use storyboard as fallback
    };

    // Return mapped poster or use a reliable default
    return (
      projectPosterMap[project.id] ||
      "https://media.jakobbackhouse.com/Img_and_Vid/Tag/Development/TagPoster1.webp"
    );
  };

  // Function to get aspect ratio class for placeholders
  const getPlaceholderClass = (project: Project) => {
    const aspectRatio =
      imageDimensions[project.id]?.width /
        imageDimensions[project.id]?.height || 1;

    if (aspectRatio > 1.7) return "panorama";
    if (aspectRatio > 1.3) return "landscape";
    if (aspectRatio > 0.8 && aspectRatio < 1.2) return "square";
    if (aspectRatio < 0.6) return "tall";
    return "portrait";
  };

  // Enhanced skeleton component using new CSS classes
  const ProjectSkeleton = () => (
    <div className="masonry-skeleton">
      {skeletonProjects.map((_, index) => (
        <div
          key={index}
          className={`masonry-skeleton-item skeleton-stagger-${(index % 9) + 1}`}
        >
          <div className="masonry-skeleton-image"></div>
          <div className="project-skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-description" />
            <div className="skeleton-description" />
            <div className="skeleton-tags">
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
              <div className="skeleton-tag" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Prevent hyphenation and mid-word breaks globally */
        * {
          -webkit-hyphens: none;
          -moz-hyphens: none;
          -ms-hyphens: none;
          hyphens: none;
          word-break: normal;
          overflow-wrap: normal;
        }
        
        /* Subtle loading spinner animation */
        .loading-spinner {
          transition: opacity 0.3s ease-in-out;
        }
        
        .loading-spinner div {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }
        
        /* Improve mobile touch targets */
        .mobile-touch-target {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        /* Prevent zoom on double tap */
        .no-zoom {
          touch-action: manipulation;
        }
        `,
        }}
      />

      <div
        ref={pageContainerRef}
        className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern overflow-x-hidden relative no-zoom"
        suppressHydrationWarning
        style={{
          visibility: "visible",
          opacity: 1,
          transition: "opacity 0.5s ease-in-out",
          pointerEvents: "auto",
        }}
      >
        {/* Background Sprites */}
        <BackgroundSprites />
        <main
          className={`${isMobile ? "pt-20" : "pt-32 md:pt-40"} transition-all duration-500 ease-in-out`}
          style={{
            visibility: "visible",
            opacity: 1,
            pointerEvents: "auto",
          }}
        >
          <div className="container mx-auto px-4">
            {/* Hero Section - Showreel and Intro side by side on desktop */}
            <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start mb-[25vh]">
              {/* Showreel Section - Left side on desktop, hidden on mobile */}
              {!isMobile && (
                <div className="relative z-10 showreel-container lg:flex-1">
                  <ScrollReveal direction="up" delay={100} duration={800}>
                    <div className="mb-8 lg:mb-0">
                      <div className="max-w-3xl mx-auto lg:max-w-none">
                        <div
                          style={{
                            padding: "56.25% 0 0 0",
                            position: "relative",
                          }}
                        >
                          <iframe
                            src="https://player.vimeo.com/video/1093033927?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                            data-exclude-memory-management="true"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              cursor: "default",
                              pointerEvents: "auto",
                            }}
                            title="ShowReel25.06.2025"
                            className={`border-2 border-black dark:border-white hover:border-orange-500 transition-all duration-300`}
                            loading="lazy"
                            onLoad={() => {
                              showreelLoaded.current = true;
                            }}
                          />
                        </div>
                        {/* Vimeo API is loaded globally in layout */}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}

              {/* Introduction Section - Right side on desktop, bottom on mobile */}
              <div className="relative z-10 lg:flex-1 lg:max-w-lg">
                <ScrollReveal direction="up" duration={800}>
                  <Link
                    href="/about"
                    className="block cursor-pointer group"
                    onMouseEnter={(e) => {
                      setShowTooltip(true);
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setShowTooltip(false)}
                    onMouseMove={(e) => {
                      if (showTooltip) {
                        setTooltipPosition({ x: e.clientX, y: e.clientY });
                      }
                    }}
                  >
                    <div className="max-w-2xl mx-auto lg:max-w-none text-center lg:text-left border-2 border-black dark:border-white p-6 md:p-8 bg-[#F3F1E9] dark:bg-[#1A1818] relative group-hover:border-orange-500 transition-all duration-300">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-mplus break-words overflow-wrap-anywhere">
                        <AnimatedText
                          text="Hi, I'm Jakob Backhouse"
                          delay={50}
                          variant={contentLoaded ? "title" : "instant"}
                          disablePixels={!contentLoaded}
                        />
                      </h1>
                      <div className="w-80 h-[1px] bg-black/50 dark:bg-white/50 mx-auto lg:mx-0 mb-6"></div>
                      <p className="text-base md:text-lg text-black dark:text-white mb-6 whitespace-normal break-normal hyphens-none">
                        I am a{" "}
                        <span className="font-bold text-orange-500">
                          design generalist
                        </span>{" "}
                        with a focus on{" "}
                        <span className="font-bold text-orange-500">
                          2D frame by frame animation
                        </span>{" "}
                        <span className="font-bold text-orange-500">
                          and instructional design
                        </span>
                        . I have 3+ years professional experience creating{" "}
                        <span className="font-bold text-orange-500">
                          2D animated explainer videos
                        </span>
                        . I have also worked on creating websites for clients
                        and designing online learning assessments. What I love
                        most about design is the{" "}
                        <span className="font-bold text-orange-500">
                          collaborative magic
                        </span>
                        . How teams can transform overwhelming problems into
                        elegant solutions that emerge from our{" "}
                        <span className="font-bold text-orange-500">
                          collective creativity
                        </span>
                        , solutions that feel almost impossible to have
                        conceived alone.
                      </p>
                    </div>
                  </Link>

                  {/* Illustration - Only show on desktop */}
                  {!isMobile && (
                    <div className="mt-8">
                      <ScrollReveal direction="up" duration={800} delay={200}>
                        <Link
                          href="/about"
                          className="block border-2 border-black dark:border-white overflow-hidden hover:border-orange-500 transition-all duration-300 cursor-pointer group"
                          onMouseEnter={(e) => {
                            setShowTooltip(true);
                            setTooltipPosition({ x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={() => setShowTooltip(false)}
                          onMouseMove={(e) => {
                            if (showTooltip) {
                              setTooltipPosition({
                                x: e.clientX,
                                y: e.clientY,
                              });
                            }
                          }}
                        >
                          <FadeInImage
                            src="https://media.jakobbackhouse.com/Img_and_Vid/WebsitePortfolio.webp"
                            alt="Decorative illustration - Click to visit about page"
                            width={720}
                            height={540}
                            priority={false}
                            className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      </ScrollReveal>
                    </div>
                  )}
                </ScrollReveal>
              </div>
            </div>

            {/* Projects Section */}
            <div className="relative">
              {/* Explore All Projects Heading */}
              <ScrollReveal direction="up" delay={100} duration={800}>
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-satoshi tracking-wider">
                    EXPLORE ALL PROJECTS
                  </p>
                </div>
              </ScrollReveal>

              {/* Categories Section - Always visible */}
              <div ref={categoriesRef} className="relative z-10 mb-8">
                <ScrollReveal direction="up" delay={150} duration={800}>
                  <div className="text-center py-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`
                         px-4 py-2 font-satoshi text-sm transition-all duration-300
                         border-2 border-black dark:border-white
                         bg-[#F3F1E9] dark:bg-[#1A1818]
                         mobile-touch-target
                         ${
                           selectedCategories.includes(category)
                             ? "text-white dark:text-black bg-black dark:bg-white scale-105"
                             : "text-black dark:text-white hover:border-orange-500 hover:scale-102"
                         }
                       `}
                          aria-pressed={selectedCategories.includes(category)}
                        >
                          {category}
                        </motion.button>
                      ))}
                      {/* Compact floating toggle for mobile */}
                      <motion.button
                        onClick={() => setShowFilters((s) => !s)}
                        className="lg:hidden px-4 py-2 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                        aria-expanded={showFilters}
                      >
                        {showFilters ? "Hide filters" : "Filters"}
                      </motion.button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>

          <main className="container mx-auto px-4 py-0 relative z-10">
            {/* Show skeleton during loading, but only if we haven't loaded content yet */}
            {isLoading && !contentLoaded ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Loading projects...
                  </p>
                </div>
              </div>
            ) : isLoading && contentLoaded ? (
              <ProjectSkeleton />
            ) : (
              <div ref={gridRef} className="masonry-container">
                <Masonry
                  breakpointCols={{ default: 3, 1024: 2, 768: 1 }}
                  className="project-masonry"
                  columnClassName="project-masonry-column"
                >
                  {filteredProjects.map((project, index) => {
                    const spans = getGridSpan(project);
                    const aspectRatio = imageDimensions[project.id]
                      ? imageDimensions[project.id].width /
                        imageDimensions[project.id]?.height
                      : 1;

                    return (
                      <ScrollReveal
                        key={project.id}
                        direction="up"
                        delay={100 * (index % 3)} // Reduced delay for faster appearance
                        duration={600} // Faster animation
                        distance="30px" // Less distance to travel
                        easing="cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                        className="project-masonry-item"
                        style={
                          {
                            "--aspect-ratio": aspectRatio,
                            // Add content-visibility for better performance
                            contentVisibility: index > 9 ? "auto" : "visible",
                            contain: index > 9 ? "content" : "none",
                          } as React.CSSProperties
                        }
                      >
                        <div
                          className="group relative cursor-pointer mobile-touch-target no-zoom"
                          onClick={(e) => handleProjectClick(project.id, e)}
                          onTouchStart={handleTouchStart(project.id)}
                          onTouchEnd={handleTouchEnd(project.id)}
                          style={{
                            WebkitTouchCallout: "none",
                            WebkitUserSelect: "none",
                            touchAction: "manipulation",
                          }}
                        >
                          <div className="relative border-2 border-black dark:border-white overflow-hidden hover:border-orange-500 transition-all duration-300">
                            <div
                              className="project-item-inner"
                              style={{
                                paddingBottom: `${(1 / aspectRatio) * 100}%`,
                              }}
                            >
                              {(project.image.endsWith(".webm") ||
                                project.image.endsWith(".mp4")) &&
                              !isSafari &&
                              !isMobile ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  webkit-playsinline="true"
                                  controls={false}
                                  disablePictureInPicture
                                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                                    loadingItems[project.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  preload="auto"
                                  onLoadedData={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    handleItemLoaded(project.id);
                                    video.play().catch(() => {
                                      // Fallback: try playing on user interaction
                                      console.log(
                                        "Autoplay prevented, will play on hover"
                                      );
                                    });
                                  }}
                                  onCanPlay={() => handleItemLoaded(project.id)}
                                  onMouseEnter={(e) => {
                                    const video = e.target as HTMLVideoElement;
                                    video.play().catch(() => {});
                                  }}
                                >
                                  {/* Prefer MP4 for Safari compatibility */}
                                  {project.image.endsWith(".mp4") ? (
                                    <source
                                      src={project.image}
                                      type="video/mp4"
                                    />
                                  ) : (
                                    <>
                                      <source
                                        src={project.image.replace(
                                          ".webm",
                                          ".mp4"
                                        )}
                                        type="video/mp4"
                                      />
                                      <source
                                        src={project.image}
                                        type="video/webm"
                                      />
                                    </>
                                  )}
                                </video>
                              ) : (project.image.endsWith(".webm") ||
                                  project.image.endsWith(".mp4")) &&
                                (isSafari || isMobile) ? (
                                <Image
                                  src={getVideoPosterImage(project)}
                                  alt={project.title}
                                  fill
                                  quality={50}
                                  priority={index < 3}
                                  loading={index < 6 ? "eager" : "lazy"}
                                  className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${
                                    loadingItems[project.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  sizes="(max-width: 640px) 90vw, 
                                       (max-width: 768px) 45vw, 
                                       (max-width: 1024px) 30vw,
                                       20vw"
                                  placeholder="blur"
                                  blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                                    `<svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${project.bgColor}"/></svg>`
                                  ).toString("base64")}`}
                                  onLoadingComplete={() => {
                                    handleItemLoaded(project.id);
                                    if (index < 6 && isLoading) {
                                      setIsLoading(false);
                                    }
                                  }}
                                  onError={() => {
                                    console.log(
                                      "Poster image failed to load (Safari/Mobile):",
                                      getVideoPosterImage(project)
                                    );
                                    handleItemLoaded(project.id);
                                  }}
                                />
                              ) : (
                                <Image
                                  src={project.image}
                                  alt={project.title}
                                  fill
                                  quality={index < 6 ? 50 : 35} // Reduced quality for better memory usage
                                  priority={index < 3}
                                  loading={index < 6 ? "eager" : "lazy"}
                                  className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${
                                    loadingItems[project.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  sizes="(max-width: 640px) 90vw, 
                                       (max-width: 768px) 45vw, 
                                       (max-width: 1024px) 30vw,
                                       20vw" // More efficient sizes
                                  placeholder="blur"
                                  blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                                    `<svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${project.bgColor}"/></svg>`
                                  ).toString("base64")}`}
                                  onLoadingComplete={() => {
                                    handleItemLoaded(project.id);
                                    if (index < 6 && isLoading) {
                                      setIsLoading(false);
                                    }
                                  }}
                                />
                              )}

                              {/* Subtle loading indicator */}
                              {loadingItems[project.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                                  <div className="loading-spinner">
                                    <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin"></div>
                                  </div>
                                </div>
                              )}

                              <div
                                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                                  isMobile
                                    ? "opacity-100" // Always visible on mobile
                                    : "opacity-0 group-hover:opacity-100" // Hover effect on desktop
                                }`}
                              >
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                  <h3 className="text-lg font-recoleta font-medium mb-2">
                                    {project.title}
                                  </h3>
                                  <p className="text-sm opacity-90 line-clamp-3 mb-3 hyphens-none break-normal">
                                    {project.description}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {project.categories?.map(
                                      (category, catIndex) => (
                                        <span
                                          key={catIndex}
                                          className={`
                                        text-xs px-2 py-1 transition-all duration-300
                                        border-2 border-white/50 bg-[#F3F1E9]/90 dark:bg-[#1A1818]/90
                                        ${
                                          selectedCategories.includes(category)
                                            ? "text-black dark:text-white bg-white dark:bg-black border-white dark:border-black"
                                            : "text-black dark:text-white hover:border-orange-500"
                                        }
                                      `}
                                        >
                                          {category}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </Masonry>
              </div>
            )}
          </main>

          <footer className="container mx-auto px-4 py-6 mt-12 relative z-10">
            <ScrollReveal direction="up" delay={400} duration={800}>
              <div className="flex justify-center space-x-6">
                <div className="p-3 md:p-4 transition-all duration-300">
                  <Link
                    href="https://www.instagram.com/jakobbackhouse_/"
                    className="text-black dark:text-white hover:text-orange-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-6 h-6" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                </div>
                <div className="p-3 md:p-4 transition-all duration-300">
                  <Link
                    href="https://www.linkedin.com/in/jakob-backhouse/"
                    className="text-black dark:text-white hover:text-orange-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-6 h-6" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </footer>

          {selectedProject && (
            <ProjectModal
              isOpen={!!selectedProject}
              onClose={() => {
                if (process.env.NODE_ENV === "development") {
                  console.log("🚪 Modal onClose called");
                }

                // FIX: Enhanced modal close with better restoration
                try {
                  // Log memory usage before restoration
                  logMemoryUsage("Before modal close");

                  // Restore home page media
                  restoreHomePageMedia();

                  // FIX: Add additional restoration steps for mobile
                  if (typeof window !== "undefined") {
                    // Ensure pointer events are restored
                    document.body.style.pointerEvents = "auto";

                    // Force a layout recalculation
                    setTimeout(() => {
                      window.dispatchEvent(new Event("resize"));
                    }, 50);
                  }

                  // Log memory usage after restoration
                  setTimeout(() => logMemoryUsage("After media restored"), 100);

                  setSelectedProject(null);

                  if (process.env.NODE_ENV === "development") {
                    console.log("✅ Modal closed successfully");
                  }
                } catch (error) {
                  if (process.env.NODE_ENV === "development") {
                    console.error("Error closing modal:", error);
                  }
                  // Fallback: still try to close
                  setSelectedProject(null);
                }
              }}
              title={
                filteredProjects.find((p) => p.id === selectedProject)?.title ||
                ""
              }
              description={
                filteredProjects.find((p) => p.id === selectedProject)
                  ?.description || ""
              }
              image={
                filteredProjects.find((p) => p.id === selectedProject)?.image ||
                ""
              }
              filteredProjects={filteredProjects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            />
          )}

          {/* Custom tooltip for illustration */}
          {showTooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-md text-sm font-satoshi shadow-lg border border-white dark:border-black"
              style={{
                left: tooltipPosition.x + 10,
                top: tooltipPosition.y - 40,
                transform: "translate(0, 0)",
              }}
            >
              Go to about page
            </div>
          )}
        </main>

        {/* Memory stats debugger - development only */}
        <MemoryStatsDebugger position="bottom-right" />
      </div>
    </>
  );
}
