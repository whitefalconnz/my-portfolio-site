"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { Instagram, Linkedin, Twitter, RotateCcw } from "lucide-react"
import ProjectModal from "./components/project/ProjectModal"
import "./grid.css"
import Header from "./components/layout/Header"
import { AspectRatio, type Project } from './types/project';
import './styles/grid.css';
import { getImageDimensions } from "./utils/imageUtils";
import SparkEffect from "./components/animations/SparkEffect"
import ScrollReveal from "./components/animations/ScrollReveal"
import AnimatedText from './utils/AnimatedText'
import Masonry from 'react-masonry-css'
import { motion, useMotionValue } from "framer-motion"
import { getCDNUrl, getOptimizedImageUrl } from './utils/cdn'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const showreelLoaded = useRef(false);
  
  // Add state for collapsible categories
  const [showFilters, setShowFilters] = useState(false);
  
  // Add state for filter button visibility based on scroll
  const [showFilterButton, setShowFilterButton] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Draggable state
  const isDraggable = false;
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPostDrag, setIsPostDrag] = useState(false);
  const postDragTimer = useRef<NodeJS.Timeout | null>(null);

  // Motion values for smoother drag without React re-renders
  const introX = useMotionValue(0);
  const introY = useMotionValue(0);
  const showreelX = useMotionValue(0);
  const showreelY = useMotionValue(0);
  const categoriesX = useMotionValue(0);
  const categoriesY = useMotionValue(0);
  const projectsGridX = useMotionValue(0);
  const projectsGridY = useMotionValue(0);
  const footerX = useMotionValue(0);
  const footerY = useMotionValue(0);

  // Track z-index per draggable element so the active one always stays on top
  const [zIndexes, setZIndexes] = useState({
    intro: 10,
    showreel: 10,
    categories: 10,
    projectsGrid: 10,
    footer: 10,
  });

  // Add a base z-index counter to ensure proper stacking
  const [baseZIndex, setBaseZIndex] = useState(10);
  type DragKey = 'intro' | 'showreel' | 'categories' | 'projectsGrid' | 'footer'
  const [activeDragKey, setActiveDragKey] = useState<DragKey | null>(null);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Cleanup
    return () => {
      observer.disconnect();
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

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
    // Reset positions function
    const resetPositions = () => {
      introX.set(0); introY.set(0);
      showreelX.set(0); showreelY.set(0);
      categoriesX.set(0); categoriesY.set(0);
      projectsGridX.set(0); projectsGridY.set(0);
      footerX.set(0); footerY.set(0);
      setHasBeenDragged(false);
    };
  
    // Track when any element is dragged
    const onDragEnd = () => {
      setIsDragging(false);
      setActiveDragKey(null);
      setIsPostDrag(true);
      
      // Clear any existing timer
      if (postDragTimer.current) {
        clearTimeout(postDragTimer.current);
      }
      
      // Set a timer to reset the post-drag state after 300ms
      postDragTimer.current = setTimeout(() => {
        setIsPostDrag(false);
        // Reset z-indices after drag is complete
        setZIndexes(prev => {
          const newZIndexes = { ...prev };
          Object.keys(newZIndexes).forEach(k => {
            newZIndexes[k as keyof typeof zIndexes] = baseZIndex;
          });
          return newZIndexes;
        });
      }, 300);
    };
  
    // Calculate drag constraints based on viewport
    const getDragConstraints = () => {
      if (typeof window === 'undefined') return { left: -100, right: 100, top: -100, bottom: 100 };
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      return {
        left: -vw * 0.3,
        right: vw * 0.3,
        top: -vh * 0.3,
        bottom: vh * 0.3
      };
    };
  
    // Safe click handler that prevents clicks during/after drag
    const handleProjectClick = (projectId: string) => {
      if (isDragging || isPostDrag) {
        return; // Prevent clicks if dragging or just finished dragging
      }
      setSelectedProject(projectId);
    };
  
    // Add a drag handle component for reuse
    const DragHandle = () => (
      <div className="absolute top-2 right-2 cursor-move opacity-40 hover:opacity-100 z-20">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" />
          <path d="M12 7C13.1046 7 14 6.10457 14 5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5C10 6.10457 10.8954 7 12 7Z" fill="currentColor" />
          <path d="M12 21C13.1046 21 14 20.1046 14 19C14 17.8954 13.1046 17 12 17C10.8954 17 10 17.8954 10 19C10 20.1046 10.8954 21 12 21Z" fill="currentColor" />
          <path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14Z" fill="currentColor" />
          <path d="M5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7Z" fill="currentColor" />
          <path d="M5 21C6.10457 21 7 20.1046 7 19C7 17.8954 6.10457 17 5 17C3.89543 17 3 17.8954 3 19C3 20.1046 3.89543 21 5 21Z" fill="currentColor" />
          <path d="M19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12C17 13.1046 17.8954 14 19 14Z" fill="currentColor" />
          <path d="M19 7C20.1046 7 21 6.10457 21 5C21 3.89543 20.1046 3 19 3C17.8954 3 17 3.89543 17 5C17 6.10457 17.8954 7 19 7Z" fill="currentColor" />
          <path d="M19 21C20.1046 21 21 20.1046 21 19C21 17.8954 20.1046 17 19 17C17.8954 17 17 17.8954 17 19C17 20.1046 17.8954 21 19 21Z" fill="currentColor" />
        </svg>
      </div>
    );

  const categories = [
    "Animation",
    "Graphic Design",
    "Creative Advertising",
    "Illustration",
    "Drawing",
    "Projects" // Added new category
  ];

  // Safe toggle category handler that prevents clicks during/after drag
  const handleToggleCategory = (category: string) => {
    if (isDragging || isPostDrag) {
      return; // Prevent toggles if dragging or just finished dragging
    }
    
    // Save current window scroll position
    const scrollPosition = window.scrollY;
    
    // Add filtering class for smooth transition
    const masonryElement = document.querySelector('.project-masonry');
    if (masonryElement) {
      masonryElement.classList.add('filtering');
    }
    
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    
    // Restore window scroll position and remove filtering class after state update
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'auto' // Use 'auto' instead of 'smooth' to prevent visible scrolling
      });
      
      if (masonryElement) {
        masonryElement.classList.remove('filtering');
      }
    }, 50); // Slight delay to ensure smooth transition
  };

  // Replace the original toggleCategory function with our safe version
  const toggleCategory = handleToggleCategory;

  const projects: Project[] = [
    // Paintings and Illustrations
    {
      id: "Illustrations",
      title: "Illustrations & Paintings",
      image: getCDNUrl("/Img_and_Vid/PersonalPaintings/HighaltitudeLandScape(compressed).webp"),
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "A collection of digital paintings, illustrations, and traditional artworks exploring various themes and techniques.",
      categories: ["Illustration", "Drawing"],
    },
    // Creative Advertising Projects
    {
      id: "Creative Advertising",
      title: "Tales from the Sun",
      image: getCDNUrl("/Img_and_Vid/TalesFromTheSun/TalesFromTheSun_Title_Nice Tan.webp"),
      aspectRatio: AspectRatio.LANDSCAPE,
      bgColor: "bg-[#5C3E3C]",
      description: "A strategic advertising campaign exploring cultural narratives and travel experiences.",
      categories: ["Creative Advertising", "Graphic Design", "Projects"],
    },
    {
      id: "BumbleGanttWithTheWind",
      title: "BumbleGantt With The Wind",
      image: getCDNUrl("/Img_and_Vid/GanttWithTheWind/GanttWithTheWind.webp"),
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "Project management tool redesign focusing on user experience and workflow optimization.",
      categories: ["Creative Advertising", "Graphic Design", "Projects"],
    },
    // Animation Projects
    {
      id: "SmokeAnimation",
      title: "Smoke Animation",
      image: getCDNUrl("/Img_and_Vid/SmokePreview.webm"),
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "Experimental animation exploring particle dynamics and fluid motion.",
      categories: ["Animation", "Projects"],
    },
    {
      id: "MySafetyTV",
      title: "MySafetyTV",
      image: getCDNUrl("/Img_and_Vid/MySafetyTV.png"),
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "Animated safety awareness campaign combining education and entertainment.",
      categories: ["Animation", "Creative Advertising", "Projects"],
    },
    // Update Creative Coding project
    {
      id: "CreativeCoding",
      title: "Creative Coding",
      image: getCDNUrl("/Img_and_Vid/Coded_Painting/output_3.png"),
      aspectRatio: AspectRatio.SQUARE,
      bgColor: "bg-[#5C3E3C]",
      description: "Interactive digital experiences created through creative coding.",
      categories: ["Projects", "Animation", "Graphic Design"],
    }
  ];

  const getStoredProjects = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('projectOrder');
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
    const storedVersion = localStorage.getItem('projectDataVersion');
    
    if (storedProjects.length === projects.length && storedVersion === dataVersion) {
      setRandomizedProjects(storedProjects);
      // Show content immediately if we have stored projects
      setContentLoaded(true);
    } else {
      // Clear existing data and store new version
      const newRandomized = shuffleArray(projects);
      setRandomizedProjects(newRandomized);
      localStorage.setItem('projectOrder', JSON.stringify(newRandomized));
      localStorage.setItem('projectDataVersion', dataVersion);
      // Show content after a short delay for first-time visitors
      setTimeout(() => setContentLoaded(true), 300);
    }

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
          dimensions[project.id] = project.image.endsWith('.webm') 
            ? { width: 1920, height: 1080 }  // Default video dimensions
            : { width: 400, height: 300 };    // Default image dimensions
          
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
    const imageRatio = imageDimensions[project.id]?.width / imageDimensions[project.id]?.height || 1;
    
    if (imageRatio > 1.7) { // Very wide images (panorama)
      return { cols: 4, rows: 3 };
    } else if (imageRatio > 1.3) { // Landscape
      return { cols: 3, rows: 3 };
    } else if (imageRatio > 0.8 && imageRatio < 1.2) { // Square-ish
      return { cols: 2, rows: 3 };
    } else if (imageRatio < 0.6) { // Very tall
      return { cols: 2, rows: 4 };
    } else { // Portrait
      return { cols: 2, rows: 4 };
    }
  };

  const currentProjectIndex = selectedProject 
    ? projects.findIndex(p => p.id === selectedProject)
    : -1;

  const handleNext = () => {
    if (currentProjectIndex < projects.length - 1) {
      setSelectedProject(projects[currentProjectIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentProjectIndex > 0) {
      setSelectedProject(projects[currentProjectIndex - 1].id);
    }
  };

  const filteredProjects = randomizedProjects.filter((project: Project) => {
    if (selectedCategories.length === 0) return true;
    return project.categories.some((category: string) => selectedCategories.includes(category));
  });

  // Add skeleton array for the loading state
  const skeletonProjects = useMemo(() => Array(9).fill(0).map((_, i) => i), []);

  // Development utility - add to console for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).resetIntro = () => {
        // localStorage.removeItem('hasSeenIntro');
        // window.location.reload();
      };
    }
  }, []);

  // Placeholder for a loading skeleton
  const ProjectSkeleton = () => <div />;

  // Helper to determine if an element should be draggable (allows active element while blocking others)
  const isElementDraggable = (key: DragKey) => {
    if (!isDraggable) return false;
    if (activeDragKey === null) return true; // Nothing is currently being dragged
    return activeDragKey === key; // Only the active element can continue to drag
  };

  const handleDragStart = (key: DragKey) => () => {
    setIsDragging(true);
    setActiveDragKey(key);
    bringToFront(key);
    if (!hasBeenDragged) setHasBeenDragged(true);
  };

  // Utility to bring the dragged element to front (maintain correct stacking order)
  const bringToFront = (key: DragKey) => {
    setBaseZIndex(prev => prev + 1);
    setZIndexes(prev => {
      const newZIndexes = { ...prev } as typeof prev;
      // Reset all other elements to base z-index
      Object.keys(newZIndexes).forEach(k => {
        if (k !== key) {
          newZIndexes[k as DragKey] = baseZIndex;
        }
      });
      // Set the dragged element to the new highest z-index
      newZIndexes[key] = baseZIndex + 1;
      return newZIndexes;
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          width: 0;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        html {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
        `
      }} />
      
      <div 
        className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern overflow-x-hidden" 
        suppressHydrationWarning
        style={{ 
          visibility: 'visible',
          opacity: 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'auto'
        }}
      >
      <SparkEffect />
      <Header />
      
      <main 
        className="pt-32 md:pt-40 transition-all duration-500 ease-in-out"
        style={{ 
          visibility: 'visible',
          opacity: 1,
          pointerEvents: 'auto'
        }}
      >
        <div className="container mx-auto px-4">
          {/* Hero Section - Showreel and Intro side by side on desktop */}
          <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start mb-[25vh]">
            {/* Showreel Section - Left side on desktop, top on mobile */}
            <motion.div 
              className="relative z-10 showreel-container lg:flex-1"
              drag={isElementDraggable('showreel')}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={getDragConstraints()}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              onDragStart={handleDragStart('showreel')}
              onDragEnd={onDragEnd}
              style={{ 
                zIndex: zIndexes.showreel,
                pointerEvents: isDragging && activeDragKey !== 'showreel' ? 'none' : 'auto',
                x: showreelX,
                y: showreelY
              }}
            >
              {isDraggable && <DragHandle />}
              <ScrollReveal direction="up" delay={100} duration={800}>
                <div className="mb-8 lg:mb-0">
                  <div className="max-w-3xl mx-auto lg:max-w-none">
                    <div style={{padding:'56.25% 0 0 0', position:'relative'}}>
                      <motion.iframe 
                        src="https://player.vimeo.com/video/955743492?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;dnt=1" 
                        frameBorder="0" 
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                        style={{
                          position:'absolute',
                          top:0,
                          left:0,
                          width:'100%',
                          height:'100%',
                          cursor: 'default',
                          pointerEvents: 'auto'
                        }}
                        title="Showreel"
                        className={`border-2 border-black dark:border-white ${isDraggable ? 'showreel-draggable' : ''}`}
                        loading="lazy"
                        onLoad={() => { showreelLoaded.current = true }}
                      />
                    </div>
                    <Script src="https://player.vimeo.com/api/player.js" />
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>

            {/* Introduction Section - Right side on desktop, bottom on mobile */}
            <motion.div
              className="relative z-10 lg:flex-1 lg:max-w-lg"
              drag={isElementDraggable('intro')}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={getDragConstraints()}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              onDragStart={handleDragStart('intro')}
              onDragEnd={onDragEnd}
              style={{ 
                zIndex: zIndexes.intro,
                pointerEvents: isDragging && activeDragKey !== 'intro' ? 'none' : 'auto',
                x: introX,
                y: introY
              }}
            >
              <ScrollReveal direction="up" duration={800}>
                <motion.div 
                  className="max-w-2xl mx-auto lg:max-w-none text-center lg:text-left border-[1px] p-6 md:p-8 bg-[#F3F1E9] dark:bg-[#1A1818] relative"
                >
                  {isDraggable && <div className="absolute top-2 right-2"><DragHandle /></div>}
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 font-mplus">
                    <AnimatedText 
                      text="Hi, I'm Jakob Backhouse"
                      delay={50}
                      variant={contentLoaded ? "title" : "instant"}
                      disablePixels={!contentLoaded}
                    />
                  </h1>
                  <div className="w-80 h-[1px] bg-black/50 dark:bg-white/50 mx-auto lg:mx-0 mb-6"></div>
                  <p className="text-base md:text-lg text-black dark:text-white mb-6 whitespace-normal break-words">
                    A
                    {" "}
                    <span className="font-bold text-black dark:text-white">
                      designer
                    </span>
                    {" "}
                    and
                    {" "}
                    <span className="font-bold text-black dark:text-white">
                      animator
                    </span>
                    {" "}
                    who thrives on uncovering
                    {" "}
                    <span className="font-bold text-black dark:text-white">
                      compelling ideas
                    </span>
                    {" "}
                    and bringing them to life through
                    {" "}
                    <span className="font-bold text-black dark:text-white">
                      great design.
                    </span>
                  </p>
                  <div className="flex justify-center lg:justify-start space-x-4">
                    <Link href="https://www.instagram.com/jakob_backhouse/" target="_blank" rel="noopener noreferrer" className="text-black dark:text-white hover:text-orange-500 transition-colors">
                      <Instagram size={24} />
                    </Link>
                    <Link href="https://www.linkedin.com/in/jakob-backhouse-is-cool/" className="text-black dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                      <Linkedin size={24} />
                    </Link>
                    <Link href="#" className="text-black dark:text-white hover:text-primary dark:hover:text-primary transition-colors">
                      <Twitter size={24} />
                    </Link>
                  </div>
                </motion.div>
              </ScrollReveal>
            </motion.div>
          </div>

          {/* Featured Work Section - Styled like showreel */}
          <div className="mb-40">
            <ScrollReveal direction="up" delay={100} duration={800}>
              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono tracking-wider">
                  FEATURED WORK
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150} duration={800}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Primary Project - Takes full width on mobile, left side on desktop */}
                <motion.div
                  className="group cursor-pointer"
                  onClick={() => handleProjectClick("MySafetyTV")}
                >
                  <div className="relative">
                    <div className="relative border-2 border-black dark:border-white overflow-hidden">
                      <div className="aspect-[4/3] relative">
                        <Image
                          src={getCDNUrl("/Img_and_Vid/MySafetyTV.png")}
                          alt="MySafetyTV"
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-105"
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">MySafetyTV</h3>
                            <p className="text-sm opacity-90 line-clamp-3 mb-3">Animated safety awareness campaign combining education and entertainment through engaging character-driven storytelling.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {["Animation", "Creative Advertising", "Projects"].map((category) => (
                                <span key={category} className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm">
                                  {category}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs opacity-75">Click to view full project details</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold mb-1 text-black dark:text-white">MySafetyTV</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wide">ANIMATION • ADVERTISING</p>
                  </div>
                </motion.div>

                {/* Second Project */}
                <motion.div
                  className="group cursor-pointer"
                  onClick={() => handleProjectClick("SmokeAnimation")}
                >
                  <div className="relative">
                    <div className="relative border-2 border-black dark:border-white overflow-hidden">
                      <div className="aspect-[4/3] relative">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          preload="metadata"
                        >
                          <source src={getCDNUrl("/Img_and_Vid/SmokePreview.webm")} type="video/webm" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">Smoke Animation</h3>
                            <p className="text-sm opacity-90 line-clamp-3 mb-3">Experimental animation exploring particle dynamics and fluid motion using advanced simulation techniques.</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {["Animation", "Projects"].map((category) => (
                                <span key={category} className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm">
                                  {category}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs opacity-75">Click to view full project details</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-bold mb-1 text-black dark:text-white">Smoke Animation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono tracking-wide">EXPERIMENTAL • ANIMATION</p>
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>
          </div>

          {/* Projects Section with Filter Button */}
          <div className="relative">
            {/* Filter Toggle Button - Only shows when scrolled past categories */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="fixed left-4 top-1/2 -translate-y-1/2 z-30 bg-white dark:bg-[#2A2A2A] p-3 border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={showFilters ? "Hide Filters" : "Show Filters"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: showFilterButton ? 1 : 0,
                x: showFilterButton ? 0 : -20,
                pointerEvents: showFilterButton ? 'auto' : 'none'
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}
              >
                <path 
                  d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zM6 8a1 1 0 011-1h10a1 1 0 110 2H7a1 1 0 01-1-1zM9 12a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" 
                  fill="currentColor"
                />
              </svg>
            </motion.button>

            {/* Explore All Projects Heading */}
            <ScrollReveal direction="up" delay={100} duration={800}>
              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono tracking-wider">
                  EXPLORE ALL PROJECTS
                </p>
              </div>
            </ScrollReveal>

            {/* Collapsible Categories Section - Now underneath the heading */}
            <motion.div
              ref={categoriesRef}
              className="relative z-10 mb-8"
              drag={isElementDraggable('categories')}
              dragMomentum={false}
              dragElastic={0}
              dragConstraints={getDragConstraints()}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              onDragStart={handleDragStart('categories')}
              onDragEnd={onDragEnd}
              style={{ 
                zIndex: zIndexes.categories,
                pointerEvents: isDragging && activeDragKey !== 'categories' ? 'none' : 'auto',
                x: categoriesX,
                y: categoriesY
              }}
              initial={false}
              animate={{ 
                height: showFilters ? 'auto' : 0,
                opacity: showFilters ? 1 : 0,
                marginBottom: showFilters ? 32 : 8
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {isDraggable && <DragHandle />}
              <div className="overflow-hidden">
                <ScrollReveal direction="up" delay={150} duration={800}>
                  <div className="text-center py-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          onClick={() => toggleCategory(category)}
                          className={`
                           px-4 py-2 font-mono text-sm transition-all duration-300
                           border-2 border-black dark:border-white
                           ${selectedCategories.includes(category)
                             ? 'bg-black dark:bg-white text-white dark:text-black scale-105'
                             : 'bg-transparent hover:bg-black/10 dark:hover:bg-white/10 hover:scale-102'}
                         `}
                          aria-pressed={selectedCategories.includes(category)}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.main 
          className="container mx-auto px-4 py-0 relative z-10"
          drag={isElementDraggable('projectsGrid')}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={getDragConstraints()}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragStart={handleDragStart('projectsGrid')}
          onDragEnd={onDragEnd}
          style={{ 
            zIndex: zIndexes.projectsGrid,
            pointerEvents: isDragging && activeDragKey !== 'projectsGrid' ? 'none' : 'auto',
            x: projectsGridX,
            y: projectsGridY
          }}
        >
          {isDraggable && <DragHandle />}
          {/* Show skeleton during loading, but only if we haven't loaded content yet */}
          {isLoading && !contentLoaded ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading projects...</p>
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
                    ? imageDimensions[project.id].width / imageDimensions[project.id]?.height 
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
                      style={{
                        '--aspect-ratio': aspectRatio,
                        // Add content-visibility for better performance
                        contentVisibility: index > 9 ? 'auto' : 'visible',
                        contain: index > 9 ? 'content' : 'none'
                      } as React.CSSProperties}
                    >
                      <motion.div
                        className="group relative cursor-pointer"
                        onClick={() => handleProjectClick(project.id)}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="relative border-2 border-black dark:border-white overflow-hidden">
                          <div className="project-item-inner" style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}>
                            {project.image.endsWith('.webm') ? (
                              <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                preload="metadata"
                              >
                                <source src={project.image} type="video/webm" />
                              </video>
                            ) : (
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                quality={index < 6 ? 60 : 25}
                                priority={index < 3}
                                loading={index < 6 ? 'eager' : 'lazy'}
                                className="object-cover w-full h-full transition-all duration-500 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 
                                       (max-width: 768px) 50vw, 
                                       (max-width: 1024px) 33vw,
                                       25vw"
                                placeholder="blur"
                                blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                                  `<svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${project.bgColor}"/></svg>`
                                ).toString('base64')}`}
                                onLoadingComplete={() => {
                                  if (index < 6 && isLoading) {
                                    setIsLoading(false);
                                  }
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                                <p className="text-sm opacity-90 line-clamp-3 mb-3">{project.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.categories?.map((category, catIndex) => (
                                    <span 
                                      key={catIndex} 
                                      className={`
                                        text-xs px-2 py-1 backdrop-blur-sm transition-all duration-300
                                        ${selectedCategories.includes(category) 
                                          ? 'bg-white/30 text-white font-medium border border-white/50' 
                                          : 'bg-white/20 text-white/90'}
                                      `}
                                    >
                                      {category}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </ScrollReveal>
                  );
                })}
              </Masonry>
            </div>
          )}
        </motion.main>

        <motion.footer 
          className="container mx-auto px-4 py-6 mt-12 relative z-10"
          drag={isElementDraggable('footer')}
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={getDragConstraints()}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          onDragStart={handleDragStart('footer')}
          onDragEnd={onDragEnd}
          style={{ 
            zIndex: zIndexes.footer,
            pointerEvents: isDragging && activeDragKey !== 'footer' ? 'none' : 'auto',
            x: footerX,
            y: footerY
          }}
        >
          {isDraggable && <DragHandle />}
          <ScrollReveal direction="up" delay={400} duration={800}>
            <div className="flex justify-center space-x-6">
              <motion.div
                className="border p-1"
              >
                <Link href="https://www.instagram.com/jakobbackhouse_/" className="text-dark/60 dark:text-light/60 hover:text-primary dark:hover:text-primary transition-colors">
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </motion.div>
              <motion.div
                className="border p-1"
              >
                <Link href="https://www.linkedin.com/in/jakob-backhouse-is-cool/" className="text-dark/60 dark:text-light/60 hover:text-primary dark:hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </motion.div>
              <motion.div
                className="border p-1"
              >
                <Link href="#" className="text-dark/60 dark:text-light/60 hover:text-primary dark:hover:text-primary transition-colors">
                  <Twitter className="w-6 h-6" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </motion.div>
            </div>
          </ScrollReveal>
        </motion.footer>

        {selectedProject && (
          <ProjectModal
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
            title={projects.find(p => p.id === selectedProject)?.title || ""}
            description={projects.find(p => p.id === selectedProject)?.description || ""}
            image={projects.find(p => p.id === selectedProject)?.image || ""}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={currentProjectIndex < projects.length - 1}
            hasPrevious={currentProjectIndex > 0}
            projectId={selectedProject}
          />
        )}
      </main>
    </div>
  </>
  )
}
