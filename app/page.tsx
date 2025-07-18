"use client"

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
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
import BackgroundSprites from "./components/animations/BackgroundSprites"
import AnimatedText from './utils/AnimatedText'
import Masonry from 'react-masonry-css'
import { motion, useMotionValue } from "framer-motion"
import { getCDNUrl, getOptimizedImageUrl } from './utils/cdn'
import { useHero } from './contexts/HeroContext'
import FadeInImage from './components/common/FadeInImage'

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  
  // Debug selected project state
  useEffect(() => {
    console.log('🔍 selectedProject state changed:', {
      selectedProject,
      shouldRenderModal: !!selectedProject,
      projectFound: selectedProject ? !!projects.find(p => p.id === selectedProject) : null
    });
  }, [selectedProject]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageDimensions, setImageDimensions] = useState<Record<string, { width: number; height: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [randomizedProjects, setRandomizedProjects] = useState<Project[]>([]);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  
  // Debug hasMoreProjects state changes
  useEffect(() => {
    console.log('🔄 hasMoreProjects changed:', hasMoreProjects);
  }, [hasMoreProjects]);
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

  // Hero context
  const { showHero, heroHeight } = useHero()

  // Tooltip state for illustration
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

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

  // Performance optimization: Load projects in chunks
  const PROJECTS_PER_CHUNK = 12;
  const [currentChunk, setCurrentChunk] = useState(1);

  // Define filtered projects first
  const filteredProjects = randomizedProjects.filter((project: Project) => {
    if (selectedCategories.length === 0) return true;
    return project.categories.some((category: string) => selectedCategories.includes(category));
  });
  
  // Debug sentinel element rendering
  useEffect(() => {
    const sentinel = document.getElementById('load-more-sentinel');
    console.log('🎯 Sentinel element:', {
      exists: !!sentinel,
      hasMoreProjects,
      visibleProjectsLength: visibleProjects.length,
      filteredProjectsLength: filteredProjects.length
    });
  }, [hasMoreProjects, visibleProjects.length, filteredProjects.length]);

  // Load more projects when needed
  const loadMoreProjects = useCallback(() => {
    const startIndex = (currentChunk - 1) * PROJECTS_PER_CHUNK;
    const endIndex = startIndex + PROJECTS_PER_CHUNK;
    const newProjects = filteredProjects.slice(startIndex, endIndex);
    
    console.log('🔄 loadMoreProjects called:', {
      startIndex,
      endIndex,
      newProjectsLength: newProjects.length,
      totalFilteredProjects: filteredProjects.length,
      currentChunk,
      hasMoreProjects,
      visibleProjectsLength: visibleProjects.length
    });
    
    if (newProjects.length > 0) {
      setVisibleProjects(prev => [...prev, ...newProjects]);
      setCurrentChunk(prev => prev + 1);
      
      // Check if we've reached the end
      if (endIndex >= filteredProjects.length) {
        console.log('✅ No more projects to load, setting hasMoreProjects to false');
        setHasMoreProjects(false);
      } else {
        console.log('📦 Loaded chunk, more projects available');
      }
    } else {
      // No more projects to load
      console.log('❌ No new projects found, setting hasMoreProjects to false');
      setHasMoreProjects(false);
    }
  }, [filteredProjects, currentChunk, visibleProjects.length]);

  // Initialize visible projects
  useEffect(() => {
    console.log('🔄 Initializing visible projects:', {
      filteredProjectsLength: filteredProjects.length,
      selectedCategories
    });
    
    if (filteredProjects.length > 0) {
      const initialProjects = filteredProjects.slice(0, PROJECTS_PER_CHUNK);
      setVisibleProjects(initialProjects);
      const hasMore = filteredProjects.length > PROJECTS_PER_CHUNK;
      setHasMoreProjects(hasMore);
      setCurrentChunk(1);
      console.log('✅ Initialized with projects:', {
        initialProjectsLength: initialProjects.length,
        hasMore,
        totalProjects: filteredProjects.length
      });
    } else {
      // No projects match the filter
      setVisibleProjects([]);
      setHasMoreProjects(false);
      setCurrentChunk(1);
      console.log('❌ No projects match filter');
    }
  }, [filteredProjects]);

  // Intersection Observer for infinite loading
  useEffect(() => {
    // Use a timeout to ensure the sentinel element is rendered
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            console.log('👁️ Intersection observer triggered:', {
              isIntersecting: entry.isIntersecting,
              hasMoreProjects,
              visibleProjectsLength: visibleProjects.length,
              totalFilteredProjects: filteredProjects.length
            });
            
            if (entry.isIntersecting && hasMoreProjects) {
              console.log('🚀 Loading more projects...');
              loadMoreProjects();
            }
          });
        },
        { threshold: 0.1 }
      );

      const sentinel = document.getElementById('load-more-sentinel');
      console.log('🔍 Setting up intersection observer:', {
        sentinelExists: !!sentinel,
        hasMoreProjects,
        visibleProjectsLength: visibleProjects.length
      });
      
      if (sentinel && hasMoreProjects) {
        observer.observe(sentinel);
      }

      return () => {
        if (sentinel) {
          observer.unobserve(sentinel);
        }
      };
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId);
  }, [loadMoreProjects, hasMoreProjects, visibleProjects.length, filteredProjects.length]);

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
      console.log('🔥 handleProjectClick called:', {
        projectId,
        isDragging,
        isPostDrag,
        selectedProject,
        isDraggable,
        currentTime: new Date().toISOString()
      });
      
      // Only prevent clicks if dragging is actually enabled and we're in a drag state
      if (isDraggable && (isDragging || isPostDrag)) {
        console.log('🚫 Click prevented due to drag state');
        return; // Prevent clicks if dragging or just finished dragging
      }
      
      console.log('✅ About to call setSelectedProject with:', projectId);
      setSelectedProject(projectId);
      console.log('✅ setSelectedProject called successfully');
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
          <path d="M5 21C6.10457 21 7 20.1046 7 19C7 17.8954 6.10457 17 5 17C3.89543 17 3 17.89543 3 19C3 20.1046 3.89543 21 5 21Z" fill="currentColor" />
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
    
    // Reset loading states for newly visible projects
    setTimeout(() => {
      setLoadingItems(prev => {
        const newLoadingStates = { ...prev };
        filteredProjects.forEach(project => {
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
    // Animation Projects - Featured First
    {
      id: "Tag",
      title: "Tag",
      image: "https://res.cloudinary.com/donmpenyc/video/upload/v1750915229/TagFullInitial_nyxuqe.webm",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "This project is an animated trailer for a 2D short film that visualizes the visceral, reality-warping experience of a panic attack.", // <-- Modified description
      categories: ["Animation", "Projects"],
    },
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
      image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751495287/Storyboard_TalesFromTheSun_1_sehbwg.webp",
      aspectRatio: AspectRatio.LANDSCAPE,
      bgColor: "bg-[#5C3E3C]",
      description: "A strategic advertising campaign exploring cultural narratives and travel experiences.",
      categories: ["Creative Advertising", "Graphic Design", "Projects"],
    },
    {
      id: "BumbleGanttWithTheWind",
      title: "Bumble ICK Campaign",
      image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751495046/Storyboard_BumbleICK_2_ixhgy6.webp",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "Mock collaboration with Bumble addressing how Gen Z develop 'ICKs' as an excuse for human imperfections, promoting the app as a safe platform for vulnerability.",
      categories: ["Creative Advertising", "Graphic Design", "Projects"],
    },
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
      image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751424294/restraining_loads_pt1_1080p_vfoste.webm",
      aspectRatio: AspectRatio.PORTRAIT,
      bgColor: "bg-[#5C3E3C]",
      description: "Animated safety awareness campaign combining education and entertainment.",
      categories: ["Animation", "Creative Advertising", "Projects"],
    },
    // Update Creative Coding project
    {
      id: "CreativeCoding",
      title: "Creative Coding",
      image: "https://res.cloudinary.com/donmpenyc/image/upload/v1751494739/output_2_i4oazu.webp",
      aspectRatio: AspectRatio.SQUARE,
      bgColor: "bg-[#5C3E3C]",
      description: "Interactive digital experiences created through creative coding.",
      categories: ["Projects", "Animation", "Graphic Design"],
    },
    {
      id: "Truckmate",
      title: "Truckmate",
      image: "https://res.cloudinary.com/donmpenyc/video/upload/v1751419934/Jakob_Backhouse_BMDR16_Explainer-Video_a3jrt3.webm",
      aspectRatio: AspectRatio.LANDSCAPE,
      bgColor: "bg-[#2C4B7A]",
      description: "Animated explainer video and brand identity for a logistics platform, featuring storyboard development and logo animation.",
      categories: ["Animation", "Creative Advertising", "Projects"],
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
    const dataVersion = "1.3"; // Increment this when making changes to project data
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

    // Initialize loading states for all projects
    const initialLoadingStates: Record<string, boolean> = {};
    projects.forEach(project => {
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
          dimensions[project.id] = (project.image.endsWith('.webm') || project.image.endsWith('.mp4'))
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

  // Function to handle individual item loading completion
  const handleItemLoaded = (projectId: string) => {
    setLoadingItems(prev => ({
      ...prev,
      [projectId]: false
    }));
  };

  // Function to get aspect ratio class for placeholders
  const getPlaceholderClass = (project: Project) => {
    const aspectRatio = imageDimensions[project.id]?.width / imageDimensions[project.id]?.height || 1;
    
    if (aspectRatio > 1.7) return 'panorama';
    if (aspectRatio > 1.3) return 'landscape';
    if (aspectRatio > 0.8 && aspectRatio < 1.2) return 'square';
    if (aspectRatio < 0.6) return 'tall';
    return 'portrait';
  };

  // Enhanced skeleton component using new CSS classes
  const ProjectSkeleton = () => (
    <div className="masonry-skeleton">
      {skeletonProjects.map((_, index) => (
        <div key={index} className={`masonry-skeleton-item skeleton-stagger-${(index % 9) + 1}`}>
          <div className="masonry-skeleton-image">
            <div className="retro-scan-line" />
          </div>
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
        /* Prevent hyphenation and mid-word breaks globally */
        * {
          -webkit-hyphens: none;
          -moz-hyphens: none;
          -ms-hyphens: none;
          hyphens: none;
          word-break: normal;
          overflow-wrap: normal;
        }
        `
      }} />
      
      <div 
        className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern overflow-x-hidden relative" 
        suppressHydrationWarning
        style={{ 
          visibility: 'visible',
          opacity: 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'auto'
        }}
      >
        {/* Background Sprites */}
        <BackgroundSprites />
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
                        src="https://player.vimeo.com/video/1096106663?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                        frameBorder="0" 
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                        style={{
                          position:'absolute',
                          top:0,
                          left:0,
                          width:'100%',
                          height:'100%',
                          cursor: 'default',
                          pointerEvents: 'auto'
                        }}
                        title="ShowReel25.06.2025"
                        className={`border-2 border-black dark:border-white hover:border-orange-500 transition-all duration-300 ${isDraggable ? 'showreel-draggable' : ''}`}
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
                <Link 
                  href="/about"
                  className="block cursor-pointer group"
                  onMouseEnter={(e) => {
                    setShowTooltip(true)
                    setTooltipPosition({ x: e.clientX, y: e.clientY })
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                  onMouseMove={(e) => {
                    if (showTooltip) {
                      setTooltipPosition({ x: e.clientX, y: e.clientY })
                    }
                  }}
                >
                  <motion.div 
                    className="max-w-2xl mx-auto lg:max-w-none text-center lg:text-left border-2 border-black dark:border-white p-6 md:p-8 bg-[#F3F1E9] dark:bg-[#1A1818] relative group-hover:border-orange-500 transition-all duration-300"
                  >
                    {isDraggable && <div className="absolute top-2 right-2"><DragHandle /></div>}
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
                      I am a
                      {" "}
                      <span className="font-bold text-black dark:text-white">
                        Motion designer and 2D animator
                      </span>
                      {" "}
                      with
                      {" "}
                      <span className="font-bold text-black dark:text-white">
                        3+ years of professional experience
                      </span>
                      {" "}
                      creating
                      {" "}
                      <span className="font-bold text-black dark:text-white">
                        explainer videos, promotional content, and visual narratives
                      </span>
                      {" "}
                      that drive results. Skilled in the
                      {" "}
                      <span className="font-bold text-black dark:text-white">
                        complete animation pipeline
                      </span>
                      {" "}
                      from concept to delivery, with expertise in
                      {" "}
                      <span className="font-bold text-black dark:text-white">
                        After Effects, Toon Boom Harmony, and Illustrator.
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
                </Link>
                
                {/* Illustration - Desktop only */}
                <div className="hidden lg:block mt-8">
                  <ScrollReveal direction="up" duration={800} delay={200}>
                    <Link 
                      href="/about"
                      className="block border-2 border-black dark:border-white overflow-hidden hover:border-orange-500 transition-all duration-300 cursor-pointer group"
                      onMouseEnter={(e) => {
                        setShowTooltip(true)
                        setTooltipPosition({ x: e.clientX, y: e.clientY })
                      }}
                      onMouseLeave={() => setShowTooltip(false)}
                      onMouseMove={(e) => {
                        if (showTooltip) {
                          setTooltipPosition({ x: e.clientX, y: e.clientY })
                        }
                      }}
                    >
                      <FadeInImage
                        src="https://res.cloudinary.com/donmpenyc/image/upload/v1750647391/WebsitePortfolio_xrmg3a.jpg"
                        alt="Decorative illustration - Click to visit about page"
                        width={720}
                        height={540}
                        priority={false}
                        className="block w-full h-auto group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  </ScrollReveal>
                </div>
              </ScrollReveal>
            </motion.div>
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
            >
              {isDraggable && <DragHandle />}
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
                         ${selectedCategories.includes(category)
                           ? 'text-white dark:text-black bg-black dark:bg-white scale-105'
                           : 'text-black dark:text-white hover:border-orange-500 hover:scale-102'}
                       `}
                        aria-pressed={selectedCategories.includes(category)}
                      >
                        {category}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
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
                {visibleProjects.map((project, index) => {
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectClick(project.id);
                        }}
                        drag={false}
                        dragConstraints={false}
                        style={{
                          // Ensure proper touch handling on mobile
                          touchAction: 'manipulation',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none'
                        }}
                      >
                        <div className="relative border-2 border-black dark:border-white overflow-hidden hover:border-orange-500 transition-all duration-300">
                          <div className="project-item-inner" style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}>
                            
                            {/* Loading placeholder overlay */}
                            {loadingItems[project.id] && (
                              <div className={`absolute inset-0 image-placeholder ${getPlaceholderClass(project)} ${
                                (project.image.endsWith('.webm') || project.image.endsWith('.mp4')) ? 'video-placeholder' : ''
                              }`}>
                                <div className="retro-scan-line" />
                              </div>
                            )}

                            {(project.image.endsWith('.webm') || project.image.endsWith('.mp4')) ? (
                              <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                webkit-playsinline="true"
                                controls={false}
                                disablePictureInPicture
                                className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                                  loadingItems[project.id] ? 'opacity-0' : 'opacity-100'
                                }`}
                                preload="auto"
                                onLoadedData={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  handleItemLoaded(project.id);
                                  video.play().catch(() => {
                                    // Fallback: try playing on user interaction
                                    console.log('Autoplay prevented, will play on hover');
                                  });
                                }}
                                onCanPlay={() => handleItemLoaded(project.id)}
                                onMouseEnter={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.play().catch(() => {});
                                }}
                              >
                                {/* Prefer MP4 for Safari compatibility */}
                                {project.image.endsWith('.mp4') ? (
                                  <source src={project.image} type="video/mp4" />
                                ) : (
                                  <>
                                    <source src={project.image.replace('.webm', '.mp4')} type="video/mp4" />
                                    <source src={project.image} type="video/webm" />
                                  </>
                                )}
                              </video>
                            ) : (
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                quality={index < 6 ? 60 : 25}
                                priority={index < 3}
                                loading={index < 6 ? 'eager' : 'lazy'}
                                className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${
                                  loadingItems[project.id] ? 'opacity-0' : 'opacity-100'
                                }`}
                                sizes="(max-width: 640px) 100vw, 
                                       (max-width: 768px) 50vw, 
                                       (max-width: 1024px) 33vw,
                                       25vw"
                                placeholder="blur"
                                blurDataURL={`data:image/svg+xml;base64,${Buffer.from(
                                  `<svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${project.bgColor}"/></svg>`
                                ).toString('base64')}`}
                                onLoadingComplete={() => {
                                  handleItemLoaded(project.id);
                                  if (index < 6 && isLoading) {
                                    setIsLoading(false);
                                  }
                                }}
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <h3 className="text-lg font-recoleta font-medium mb-2">{project.title}</h3>
                                <p className="text-sm opacity-90 line-clamp-3 mb-3 hyphens-none break-normal">{project.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  {project.categories?.map((category, catIndex) => (
                                    <span 
                                      key={catIndex} 
                                      className={`
                                        text-xs px-2 py-1 transition-all duration-300
                                        border-2 border-white/50 bg-[#F3F1E9]/90 dark:bg-[#1A1818]/90
                                        ${selectedCategories.includes(category) 
                                          ? 'text-black dark:text-white bg-white dark:bg-black border-white dark:border-black' 
                                          : 'text-black dark:text-white hover:border-orange-500'}
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
              
              {/* Load more sentinel for infinite scrolling */}
              {hasMoreProjects && (
                <div 
                  id="load-more-sentinel" 
                  className="h-10 w-full flex items-center justify-center"
                  onMouseEnter={() => {
                    console.log('🖱️ Mouse entered sentinel, triggering load');
                    if (hasMoreProjects) {
                      loadMoreProjects();
                    }
                  }}
                >
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {!hasMoreProjects && visibleProjects.length > 0 && (
                <div className="h-10 w-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                  All projects loaded
                </div>
              )}
              {/* Debug info */}
              <div className="text-xs text-gray-400 p-2 text-center">
                Debug: {visibleProjects.length}/{filteredProjects.length} projects, hasMore: {hasMoreProjects.toString()}
              </div>
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
                className="border-2 border-black dark:border-white p-3 md:p-4 bg-[#F3F1E9] dark:bg-[#1A1818] hover:border-orange-500 transition-all duration-300"
              >
                <Link href="https://www.instagram.com/jakobbackhouse_/" className="text-black dark:text-white hover:text-orange-500 transition-colors">
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </motion.div>
              <motion.div
                className="border-2 border-black dark:border-white p-3 md:p-4 bg-[#F3F1E9] dark:bg-[#1A1818] hover:border-orange-500 transition-all duration-300"
              >
                <Link href="https://www.linkedin.com/in/jakob-backhouse-is-cool/" className="text-black dark:text-white hover:text-orange-500 transition-colors">
                  <Linkedin className="w-6 h-6" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </motion.div>
              <motion.div
                className="border-2 border-black dark:border-white p-3 md:p-4 bg-[#F3F1E9] dark:bg-[#1A1818] hover:border-orange-500 transition-all duration-300"
              >
                <Link href="#" className="text-black dark:text-white hover:text-orange-500 transition-colors">
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
            onClose={() => {
              console.log('🚪 Modal onClose called');
              setSelectedProject(null);
            }}
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

        {/* Custom tooltip for illustration */}
        {showTooltip && (
          <div 
            className="fixed z-50 pointer-events-none bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-md text-sm font-satoshi shadow-lg border border-white dark:border-black"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 40,
              transform: 'translate(0, 0)'
            }}
          >
            Go to about page
          </div>
        )}
      </main>
    </div>
  </>
  )
}
