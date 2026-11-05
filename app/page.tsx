"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import ProjectModal from "./components/project/ProjectModal";
import TileMotion, {
  type TileMotionMedia,
} from "./components/project/TileMotion";
import "./grid.css";
import Header from "./components/layout/Header";
import { AspectRatio, type Project } from "./types/project";
import "./styles/grid.css";
import ScrollReveal from "./components/animations/ScrollReveal";
import Masonry from "react-masonry-css";
import { getCDNUrl, getOptimizedImageUrl } from "./utils/cdn";
import {
  clearHomePageMedia,
  restoreHomePageMedia,
  logMemoryUsage,
} from "./utils/memoryManager";
import FadeInImage from "./components/common/FadeInImage";
import { useLoading } from "./contexts/LoadingContext";
import FeatureVideo from "./components/common/FeatureVideo";
import HighlightLoop from "./components/common/HighlightLoop";
import GetInTouch from "./components/common/GetInTouch";
import { motion } from "framer-motion";
import { useAutoImageTracking } from "./hooks/useAutoMemoryManagement";
import MemoryStatsDebugger from "./components/common/MemoryStatsDebugger";

// Static project data. Declared at module scope so it keeps a stable identity
// across renders -- when this lived inside the component it produced a new array
// every render, retriggering the image-dimension effect in an endless loop.
const allProjects: Project[] = [
  // Animation Projects - Featured First
  {
    id: "Tag",
    title: "Tag",
    // A frame from the trailer, so the tile doesn't repeat the player's poster.
    image: "/videos/tag-thumbnail-v01.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
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
    id: "DesignCampaigns",
    title: "Design Campaigns",
    // A close crop of Storyboard_TalesFromTheSun.webp, which is shown in full in
    // the project itself.
    image: "/videos/design-campaigns-thumbnail-v01.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
    bgColor: "bg-[#5C3E3C]",
    description:
      "Three campaigns in one place: Tales from the Sun, Bumble ICK and Truckmate.",
    categories: ["Animation", "Creative Advertising"],
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
  {
    id: "3D Animation",
    title: "3D Animation",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/PigBoyPortfolio/Pigboy.webp",
    aspectRatio: AspectRatio.SQUARE,
    bgColor: "bg-[#2C4B7A]",
    description:
      "A selection of 3D work created in Blender, Maya and Unreal Engine.",
    categories: ["Animation"],
  },
  // Update Creative Coding project
  {
    id: "CreativeCoding",
    title: "Creative Coding",
    image:
      "https://media.jakobbackhouse.com/Img_and_Vid/CreativeCoding/output_2.webp",
    aspectRatio: AspectRatio.LANDSCAPE,
    bgColor: "bg-[#5C3E3C]",
    description:
      "How can I create an image manipulator in p5.js that can turn any photo into a painting? What type of images and style should I use to convey the feeling of going for bush walks when I was younger? To create this effect, I thought about how paintings are made and what makes them look like paintings. The primary reason is the effect of using a brush, so the focus of the project was creating the effect of brush strokes in the slightly random but logical way that a painter would create them.",
    categories: ["Illustration"],
  },
];

// Projects kept on file but not shown on the site. To bring one back, remove its
// id from this list; its tile, modal and search data all return with it.
const HIDDEN_PROJECT_IDS = ["MySafetyTV"];

const projects = allProjects.filter(
  (project) => !HIDDEN_PROJECT_IDS.includes(project.id)
);

// Intrinsic size of each project's grid media, used only for its aspect ratio.
// These used to be measured at runtime by downloading every original -- about
// 7.7 MB of print-resolution images plus video metadata on each home visit --
// and the grid waited for that to finish. Values match what that measurement
// produced. If a project's image or video changes, update its entry here.
// Always shown first, in this order, ahead of the shuffled projects.
const PINNED_PROJECT_IDS = ["Tag", "CreativeCoding"];

const PROJECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  Tag: { width: 1920, height: 1080 },
  Illustrations: { width: 2160, height: 2700 },
  DesignCampaigns: { width: 1600, height: 1062 },
  SmokeAnimation: { width: 1920, height: 1080 },
  MySafetyTV: { width: 1280, height: 720 },
  "3D Animation": { width: 1080, height: 1080 },
  // A 16:9 frame, not the image's own size: the 1920x640 source is cropped to fit.
  CreativeCoding: { width: 1920, height: 1080 },
};

// Tells the browser how wide a grid image is drawn, so it requests a file that
// matches rather than stretching a smaller one. The widths follow the grid: one
// column up to 768px, two up to 1024px, then three, inside Tailwind's container
// steps. Update them if the columns or gaps change.
const gridImageSizes = (scale = 1) =>
  [
    `(max-width: 768px) ${Math.round(90 * scale)}vw`,
    `(max-width: 1023px) ${Math.round(345 * scale)}px`,
    `(max-width: 1024px) ${Math.round(465 * scale)}px`,
    `(max-width: 1279px) ${Math.round(300 * scale)}px`,
    `(max-width: 1535px) ${Math.round(385 * scale)}px`,
    `${Math.round(470 * scale)}px`,
  ].join(", ");

// Images drawn wider than their tile. The 3:1 Creative Coding image is cropped
// into a 16:9 tile, so it's drawn about 1.7x the tile's width.
const PROJECT_IMAGE_SCALE: Record<string, number> = {
  CreativeCoding: 1.7,
};

// Tiles that need more than the default compression. Pigboy's smooth wall and
// fine render grain smear at 50, and 75 is still only about 18 KB at full size.
const PROJECT_IMAGE_QUALITY: Record<string, number> = {
  "3D Animation": 75,
};

// What each tile does when it's hovered, or on screen on a touch device. Clips
// were cut from the project's own footage and start close to the poster. A
// project with no entry here keeps a still tile.
const MEDIA_HOST = "https://media.jakobbackhouse.com/Img_and_Vid";
const PROJECT_MOTION: Record<string, TileMotionMedia> = {
  Tag: { kind: "clip", base: "/videos/tag-tile-v01" },
  SmokeAnimation: { kind: "clip", base: "/videos/smoke-tile-v01" },
  Illustrations: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/PersonalPaintings/BrightLights.webp`, width: 2480, height: 3508 },
      { src: `${MEDIA_HOST}/PersonalPaintings/HighaltitudeLandScape(compressed).webp`, width: 5752, height: 8136 },
      { src: `${MEDIA_HOST}/PersonalPaintings/New_Series.webp`, width: 3508, height: 2480 },
      { src: `${MEDIA_HOST}/PersonalPaintings/Run(compressed).webp`, width: 1906, height: 2700 },
      { src: `${MEDIA_HOST}/PersonalPaintings/11.webp`, width: 4961, height: 3508 },
      { src: `${MEDIA_HOST}/PersonalPaintings/photobash.webp`, width: 3508, height: 4961 },
      { src: `${MEDIA_HOST}/PersonalPaintings/RBackgroundScene3Pencil(0.4).webp`, width: 4364, height: 2454 },
      { src: `${MEDIA_HOST}/PersonalPaintings/SaddleRoadQuickSketch.webp`, width: 2160, height: 2700 },
    ],
  },
  CreativeCoding: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/CreativeCoding/output_3.webp`, width: 1920, height: 640 },
      { src: `${MEDIA_HOST}/CreativeCoding/output_1.webp`, width: 1920, height: 640 },
      { src: `${MEDIA_HOST}/CreativeCoding/output_2.webp`, width: 1920, height: 640 },
    ],
  },
  // One image from each of the three campaigns.
  DesignCampaigns: {
    kind: "slides",
    images: [
      { src: `${MEDIA_HOST}/GanttWithTheWind/KickTheIckSlide.webp`, width: 1868, height: 1048 },
      { src: `${MEDIA_HOST}/TruckMate/Jakob_Backhouse_BMD1R6_Mockup.webp`, width: 8333, height: 5188 },
      { src: "/videos/design-campaigns-thumbnail-v01.webp", width: 1600, height: 1062 },
    ],
  },
  // Stills from the films in this project. A clip can replace these when one is
  // exported: there's no video file to cut from yet.
  "3D Animation": {
    kind: "slides",
    images: [
      { src: "/videos/3d-tile-stagefright-v01.webp", width: 720, height: 720 },
      { src: `${MEDIA_HOST}/PigBoyPortfolio/SpiritzThumbnail-min.jpg`, width: 3264, height: 1896 },
      { src: "/videos/3d-tile-sunchaser-v01.webp", width: 720, height: 720 },
      { src: "/videos/3d-tile-sculpture-v01.webp", width: 720, height: 720 },
      { src: `${MEDIA_HOST}/PigBoyPortfolio/Pigboy.webp`, width: 1080, height: 1080 },
    ],
  },
};

// Structured data for the work on this page. Projects open in a modal rather
// than at their own URLs, so this is how their titles, descriptions and images
// reach search engines. Built once from the same data the grid renders.
const PROJECTS_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://jakobbackhouse.com/#work",
  url: "https://jakobbackhouse.com/",
  name: "Work | Jakob Backhouse",
  about: { "@id": "https://jakobbackhouse.com/#person" },
  isPartOf: { "@id": "https://jakobbackhouse.com/#website" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        // Video thumbnails aren't images; omit rather than mislabel them.
        ...(/\.(webm|mp4)$/.test(project.image)
          ? {}
          : { image: new URL(project.image, "https://jakobbackhouse.com/").href }),
        genre: project.categories,
        creator: { "@id": "https://jakobbackhouse.com/#person" },
      },
    })),
  },
});

// useLayoutEffect runs before the browser paints; it's a no-op (with a warning)
// during server rendering, so fall back to useEffect there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Home() {
  // True only while the first-load screen is showing. The page renders behind
  // it (hidden) so its text reaches search engines, but the trailer row and the
  // grid wait for it to lift, exactly as before: on a phone the server HTML
  // would otherwise carry the desktop-only trailer, whose poster gets fetched
  // before React can remove it, and the grid's autoplaying videos would compete
  // with the loading animation for bandwidth.
  const { isLoading: firstLoadGate } = useLoading();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageDimensions] = useState(PROJECT_DIMENSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>([]);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Whether isMobile reflects the real viewport yet. The desktop-only trailer
  // row waits for this, so a phone never inserts it (and never fetches its
  // poster) on the way to finding out it's a phone.
  const [viewportKnown, setViewportKnown] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
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

  // Add state for filter button visibility based on scroll
  const [showFilterButton, setShowFilterButton] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Tooltip state for illustration
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Runs before paint so the first frame already has the right layout for the
  // device: previously a phone painted desktop padding and the desktop-only
  // trailer row first, then animated to the mobile layout a frame later.
  useIsomorphicLayoutEffect(() => {
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
    setViewportKnown(true);
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
    let frame = 0;

    // Read layout inside a rAF so a fast scroll coalesces into one measurement
    // per frame instead of one per scroll event.
    const measure = () => {
      frame = 0;
      // Show button when scrolled past approximately where featured section ends
      const past = window.scrollY > window.innerHeight * 1.2;
      // Only setState on an actual change -- otherwise every frame re-renders the page.
      setShowFilterButton((prev) => (prev === past ? prev : past));
    };

    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    measure(); // Check initial position

    return () => {
      if (frame) cancelAnimationFrame(frame);
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
    // Prevent event bubbling and default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Defer to the next frame so state updates settle properly on mobile
    requestAnimationFrame(() => {
      // Clear home page media to reduce memory usage
      clearHomePageMedia();
      setSelectedProject(projectId);
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


  // Browsers remember only the shuffled order of project ids, not the projects
  // themselves, so a changed image or description reaches everyone straight away.
  const getStoredOrder = (): string[] => {
    try {
      const stored = JSON.parse(localStorage.getItem("projectOrderIds") ?? "[]");
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  };

  const shuffleArray = (array: Project[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Pinned projects keep their fixed order at the front; the rest are shuffled
  const orderProjects = (array: Project[]) => {
    const pinned = PINNED_PROJECT_IDS.flatMap((id) =>
      array.filter((project) => project.id === id)
    );
    const rest = array.filter(
      (project) => !PINNED_PROJECT_IDS.includes(project.id)
    );
    return [...pinned, ...shuffleArray(rest)];
  };

  useEffect(() => {
    // Reuse the visitor's saved order while it still fits the current project
    // list: every project present, none gone, and pinned projects still in front.
    const storedOrder = getStoredOrder();
    const storedProjects = storedOrder.flatMap((id) =>
      projects.filter((project) => project.id === id)
    );

    if (
      storedOrder.length === projects.length &&
      new Set(storedProjects).size === projects.length &&
      PINNED_PROJECT_IDS.every((id, index) => storedOrder[index] === id)
    ) {
      setRandomizedProjects(storedProjects);
      // Show content immediately if we have stored projects
      setContentLoaded(true);
    } else {
      const newRandomized = orderProjects(projects);
      setRandomizedProjects(newRandomized);
      try {
        localStorage.setItem(
          "projectOrderIds",
          JSON.stringify(newRandomized.map((project) => project.id))
        );
        // Older visits saved the whole project list under these keys.
        localStorage.removeItem("projectOrder");
        localStorage.removeItem("projectDataVersion");
      } catch {
        // Storage can be unavailable; the order just won't persist.
      }
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

  // Dimensions are static (PROJECT_DIMENSIONS), so the grid is ready as soon
  // as the project order is known -- nothing to download first.
  useEffect(() => {
    if (contentLoaded) setIsLoading(false);
  }, [contentLoaded]);

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
        className="min-h-screen bg-ground grid-pattern overflow-x-hidden relative no-zoom"
        suppressHydrationWarning
        style={{
          visibility: "visible",
          opacity: 1,
          transition: "opacity 0.5s ease-in-out",
          pointerEvents: "auto",
        }}
      >
        <main
          className={`${isMobile ? "pt-4" : "pt-8 md:pt-10"} transition-all duration-500 ease-in-out`}
          style={{
            visibility: "visible",
            opacity: 1,
            pointerEvents: "auto",
          }}
        >
          <div className="container mx-auto px-4">
            {/* Page heading. Kept for SEO and screen readers -- the visible
                intro copy lives on /about, not here. */}
            <h1 className="sr-only">
              Jakob Backhouse — animator and designer, Wellington NZ
            </h1>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: PROJECTS_JSON_LD }}
            />

            {/* Trailer and illustration, side by side. Desktop only -- on mobile
                the whole row is skipped so a phone lands straight on the work
                rather than on a video plus an empty gap. */}
            {!firstLoadGate && viewportKnown && !isMobile && (
              <>
                {/* Same treatment as the "Explore the rest of my stuff below"
                    line further down, so the two read as a pair. */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-satoshi tracking-wider">
                    G'day check out some recent highlights below
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start mb-12 lg:mb-16">
                <div className="relative z-10 showreel-container lg:flex-[19] lg:min-w-0">
                  <div>
                    <div className="mb-8 lg:mb-0">
                      <div className="max-w-3xl mx-auto lg:max-w-none">
                        {/* The Tag trailer player, moved down from the old
                            full-screen hero. Same 16:9 box the Vimeo showreel
                            embed used to occupy. */}
                        <div
                          style={{
                            padding: "56.25% 0 0 0",
                            position: "relative",
                          }}
                        >
                          <FeatureVideo />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side on desktop: the two loops above the illustration,
                    which links through to /about. A column as tall as the
                    trailer beside it, or a row of three under it on tablets. */}
                <div className="relative z-10 grid grid-cols-3 lg:grid-cols-1 items-start gap-3 lg:flex-[5] lg:min-w-0">
                  <HighlightLoop
                    base="/videos/duck-hunting-season-wip-v01a"
                    width={1280}
                    height={722}
                    label="Duck Hunting Season, work in progress animation loop"
                    paused={selectedProject !== null}
                  />
                  <HighlightLoop
                    base="/videos/flower-growing-v01"
                    width={960}
                    height={542}
                    label="Animation loop of a rose growing and blooming"
                    paused={selectedProject !== null}
                  />
                  <div>
                    <Link
                      href="/about"
                      className="block border border-line overflow-hidden hover:border-accent transition-all duration-300 cursor-pointer group"
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
                        alt="About Jakob Backhouse — illustration of an artist drawing at a desk by a window"
                        width={720}
                        height={540}
                        priority={false}
                        className="block w-full h-auto transition-transform duration-300"
                      />
                    </Link>
                  </div>
                </div>
                </div>
              </>
            )}

            {/* Projects Section */}
            <div className="relative">
              {/* Explore All Projects Heading */}
              <div>
                <div className="text-center mb-3 md:mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-satoshi tracking-wider">
                    {/* Phones skip the highlights row above, so there's no
                        "rest" to speak of. */}
                    {isMobile
                      ? "Explore my stuff below"
                      : "Explore the rest of my stuff below"}
                  </p>
                </div>
              </div>

              {/* Categories Section - Always visible */}
              <div ref={categoriesRef} className="relative z-10 mb-4 md:mb-8">
                <div>
                  <div className="text-center">
                    {/* Tighter on phones so all three fit on one line. */}
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`
                             px-3 md:px-4 py-2 font-satoshi text-sm transition-colors duration-150
                             border mobile-touch-target
                             ${
                               selectedCategories.includes(category)
                                 ? "bg-accent border-accent text-accent-contrast"
                                 : "bg-ground border-line text-ink hover:border-accent"
                             }
                           `}
                          aria-pressed={selectedCategories.includes(category)}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main className="container mx-auto px-4 py-0 relative z-10">
            {/* Show skeleton during loading, but only if we haven't loaded content yet */}
            {firstLoadGate ? null : isLoading && !contentLoaded ? (
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b border-line mx-auto"></div>
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
                      /* No entry animation -- thumbnails just appear. */
                      <div
                        key={project.id}
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
                          <div className="relative border border-line overflow-hidden hover:border-accent transition-all duration-300">
                            <div
                              className="project-item-inner"
                              style={{
                                paddingBottom: `${(1 / aspectRatio) * 100}%`,
                              }}
                            >
                              {(project.image.endsWith(".webm") ||
                                project.image.endsWith(".mp4")) &&
                              !isSafari &&
                              !isMobile &&
                              !PROJECT_MOTION[project.id] ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  webkit-playsinline="true"
                                  controls={false}
                                  disablePictureInPicture
                                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
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
                                  {/* One source, the file that exists. A derived
                                      .mp4 used to be listed first "for Safari", but
                                      no .mp4 versions were ever uploaded (all 404),
                                      and Safari gets the poster-image branch above
                                      instead -- so every other browser paid a
                                      failed request before falling back to WebM.
                                      If MP4 encodes are uploaded later, list them
                                      ahead of the WebM again. */}
                                  <source
                                    src={project.image}
                                    type={
                                      project.image.endsWith(".mp4")
                                        ? "video/mp4"
                                        : "video/webm"
                                    }
                                  />
                                </video>
                              ) : project.image.endsWith(".webm") ||
                                project.image.endsWith(".mp4") ? (
                                <Image
                                  src={getVideoPosterImage(project)}
                                  alt={project.title}
                                  fill
                                  quality={50}
                                  priority={index < 3}
                                  loading={index < 6 ? "eager" : "lazy"}
                                  className={`object-cover w-full h-full transition-all duration-500 ${
                                    loadingItems[project.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  sizes={gridImageSizes()}
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
                                  quality={
                                    PROJECT_IMAGE_QUALITY[project.id] ??
                                    (index < 6 ? 50 : 35) // Reduced quality for better memory usage
                                  }
                                  priority={index < 3}
                                  loading={index < 6 ? "eager" : "lazy"}
                                  className={`object-cover w-full h-full transition-all duration-500 ${
                                    loadingItems[project.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  sizes={gridImageSizes(
                                    PROJECT_IMAGE_SCALE[project.id]
                                  )}
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

                              {PROJECT_MOTION[project.id] && (
                                <TileMotion
                                  media={PROJECT_MOTION[project.id]}
                                  paused={selectedProject !== null}
                                  tileAspectRatio={aspectRatio}
                                  sizes={gridImageSizes}
                                  quality={
                                    PROJECT_IMAGE_QUALITY[project.id] ??
                                    (index < 6 ? 50 : 35)
                                  }
                                />
                              )}

                              {/* Subtle loading indicator */}
                              {loadingItems[project.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                                  <div className="loading-spinner">
                                    <div className="w-8 h-8 border border-white/30 border-t-white/80 rounded-full animate-spin"></div>
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
                                {/* Title only -- description and category
                                    chips are in the project view. */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                  <h3 className="text-lg font-display font-medium">
                                    {project.title}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Masonry>
              </div>
            )}
          </main>

          <section
            id="contact"
            className="container mx-auto px-4 mt-24 md:flex md:gap-8 relative z-10"
          >
            <GetInTouch />
          </section>

          <footer className="container mx-auto px-4 py-6 mt-12 relative z-10">
            <ScrollReveal direction="up" delay={400} duration={800}>
              <div className="text-center mb-3">
                <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 font-satoshi">
                  © {new Date().getFullYear()} Jakob Backhouse. All rights
                  reserved.
                </p>
              </div>
              <div className="flex justify-center space-x-6">
                <div className="p-3 md:p-4 transition-all duration-300">
                  <Link
                    href="https://www.instagram.com/jakobbackhouse_/"
                    className="text-ink hover:text-accent transition-colors"
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
                    className="text-ink hover:text-accent transition-colors"
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
              className="fixed z-50 pointer-events-none bg-ink text-ground px-3 py-2 rounded-md text-sm font-satoshi shadow-lg border border-ink"
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
