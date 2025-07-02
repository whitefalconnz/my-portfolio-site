"use client"

import { useState, useEffect } from "react"
import Header from "../components/layout/Header"
import { Mail, Briefcase, Palette, RotateCcw, Download } from 'lucide-react'
import { Badge } from "../components/ui/badge"
import SparkEffect from "../components/animations/SparkEffect"
import BackgroundSprites from "../components/animations/BackgroundSprites"
import { motion, useMotionValue } from "framer-motion";
import FadeInImage from "../components/common/FadeInImage"
import React from "react";
import ScrollReveal from "../components/animations/ScrollReveal";
import IntroSection from "../components/common/IntroSection";

export default function AboutPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const [zIndexes, setZIndexes] = useState({
    image: 10,
    bio: 10,
    experience: 10,
    skills: 10,
  });

  // Motion values for smoother, re-render-free dragging
  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);
  const bioX = useMotionValue(0);
  const bioY = useMotionValue(0);
  const experienceX = useMotionValue(0);
  const experienceY = useMotionValue(0);
  const skillsX = useMotionValue(0);
  const skillsY = useMotionValue(0);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Check if on desktop and respect reduced motion preference
    const checkIfDesktop = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsDraggable(window.innerWidth >= 1024 && !prefersReducedMotion);
    };

    // Initial checks
    checkDarkMode();
    checkIfDesktop();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Listen for window resize and motion preference changes
    window.addEventListener('resize', checkIfDesktop);
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', checkIfDesktop);

    // Set loaded state after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkIfDesktop);
      motionMediaQuery.removeEventListener('change', checkIfDesktop);
      clearTimeout(timer);
    };
  }, []);

  // Add a drag handle component for reuse
  const DragHandle = () => (
    <div className="absolute top-2 right-2 cursor-move opacity-40 hover:opacity-100">
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

  // Reset positions function – simply set all motion values back to 0
  const resetPositions = () => {
    imageX.set(0); imageY.set(0);
    bioX.set(0); bioY.set(0);
    experienceX.set(0); experienceY.set(0);
    skillsX.set(0); skillsY.set(0);
    setHasBeenDragged(false);
  };

  // Helper to flag that a drag has started
  const handleDragStart = (key: keyof typeof zIndexes) => {
    bringToFront(key);
    if (!hasBeenDragged) setHasBeenDragged(true);
  }

  // Utility to bring the dragged element to front
  const bringToFront = (key: keyof typeof zIndexes) => {
    setZIndexes(prev => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [key]: maxZ + 1 };
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1], // cubicBezier easing
        delayChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F1E9] dark:bg-[#1A1818] grid-pattern relative">
      {/* Background Sprites */}
      <BackgroundSprites />
      
      <main className="container mx-auto px-6 md:px-8 lg:px-12 mb-12 max-w-[1920px]">
        {/* Reset button (appears after dragging) */}
        {hasBeenDragged && isDraggable && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.7, y: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            onClick={resetPositions}
            className="fixed bottom-6 right-6 bg-white dark:bg-[#2A2A2A] p-2 rounded-full border-2 border-black dark:border-white z-50 shadow-md"
            title="Reset positions"
          >
            <RotateCcw size={16} />
          </motion.button>
        )}
        
        <div className="grid lg:grid-cols-12 gap-2 lg:gap-4 pt-4 lg:items-start">
            {/* Left side - Image and Skills */}
            <div className="lg:col-span-6 lg:col-start-2 space-y-6">
              {/* Image */}
              <div className="flex justify-center">
                <motion.div
                  className="relative z-10 cursor-move bg-transparent p-0 inline-block"
                  initial={{ 
                    opacity: 0, 
                    y: 0
                  }}
                  animate={{ 
                    opacity: 1,
                    y: 0,
                    transition: { 
                      duration: 0.3, 
                      ease: [0.25, 0.1, 0.25, 1]
                    }
                  }}
                  drag={isDraggable}
                  dragMomentum={false}
                  dragElastic={0}
                  onDragStart={() => handleDragStart('image')}
                  style={{ x: imageX, y: imageY, zIndex: zIndexes.image }}
                >
                  <div className="relative border-2 hover:border-orange-500 transition-all duration-300" style={{ 
                    borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                  }}>
                    {isDraggable && <DragHandle />}
                    <FadeInImage
                      src="https://res.cloudinary.com/donmpenyc/image/upload/v1750647391/WebsitePortfolio_xrmg3a.jpg"
                      alt="Decorative illustration"
                      width={720}
                      height={540}
                      priority={false}
                      className="block max-w-full h-auto"
                      style={{ pointerEvents: isDraggable ? 'none' : 'auto' }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Skills section moved under the image */}
              <div className="flex justify-center">
                <motion.div 
                  variants={item} 
                  className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-6 md:p-8 relative z-10 w-full max-w-[720px] transition-all duration-300"
                  initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                  animate={{ 
                    borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                    transition: { delay: 0.5, duration: 0.5 }
                  }}
                  whileHover={{ 
                    borderColor: '#f97316',
                    transition: { duration: 0.3 }
                  }}
                  drag={isDraggable}
                  dragMomentum={false}
                  dragElastic={0.1}
                  onDragStart={() => handleDragStart('skills')}
                  style={{ x: skillsX, y: skillsY, zIndex: zIndexes.skills }}
                >
                  {isDraggable && <DragHandle />}
                  <motion.div 
                    className="flex items-center gap-2 mb-3 border-b pb-2"
                    initial={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                    style={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                    animate={{ 
                      borderBottomColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') : 'rgba(0, 0, 0, 0)',
                      transition: { delay: 0.6, duration: 0.5 }
                    }}
                  >
                    <Palette className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                    <h2 className="font-recoleta font-medium text-lg text-dark/70 dark:text-light/70">Core Skills</h2>
                  </motion.div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Digital Illustration",
                      "Storyboarding",
                      "UI Design",
                      "After Effects vector animation or ToonBoom frame by frame animation"
                    ].map((skill, index) => (
                      <motion.div 
                        key={skill} 
                        className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                        initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                        style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                        animate={{ 
                          borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                          transition: { delay: 0.7 + (index * 0.1), duration: 0.5 }
                        }}
                        whileHover={{ 
                          borderColor: '#f97316',
                          transition: { duration: 0.3 }
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
                  borderColor: 'rgba(0, 0, 0, 0)'
                }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                  borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                  transition: { 
                    duration: 0.3, 
                    ease: [0.25, 0.1, 0.25, 1]
                  }
                }}
                whileHover={{ 
                  borderColor: '#f97316',
                  transition: { duration: 0.3 }
                }}
                drag={isDraggable}
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart('bio')}
                style={{ x: bioX, y: bioY, zIndex: zIndexes.bio }}
              >
                {isDraggable && <DragHandle />}
                <motion.h1 
                  className="font-recoleta text-3xl text-primary/80 dark:text-primary-light/80 mb-4 
                    border-b pb-2"
                  initial={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                  style={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                  animate={{ 
                    borderBottomColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') : 'rgba(0, 0, 0, 0)',
                    transition: { delay: 0.4, duration: 0.5 }
                  }}
                >
                  Kia ora!
                </motion.h1>
                <div className="space-y-3 font-satoshi">
                  <p className="text-sm leading-relaxed text-dark/70 dark:text-light/70">
                    My name is Jakob<span className="text-primary/90 dark:text-primary-light/90"></span>, 
                     I am a Wellington-based designer and animator based in Mount Victoria near the beach (freezing ocean dives are the best way to refresh my mind).
                  </p>
                  <p className="text-sm leading-relaxed text-secondary/60 dark:text-secondary-light/60">
              <br></br>For the past four years, I've been immersed in the design industry, I specialise in crafting boutique frame by frame and vector based explainer video animation. Although I have wide range of knowledge working with clients to make websites, graphic design and 3D animation.

  <br></br><br></br>Recently I have been involved in a startup where I built extensive content – from our core educational animations to the website and its SEO – helping scale it from concept to our first customers. Alongside this time, I've developed a frame by frame animated short film, a passion I continue to nurture. 
  <br></br><br></br>Artistically, I am inspired by animation masters like Satoshi Kon and Masaaki Yuasa but in design I'm driven to blend my artistic vision with human centred design, creating work that's both distinctive and empathetic. 

                  </p>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <motion.a
                      href="mailto:JakobBackhouse@gmail.com"
                      className="inline-flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 text-black
                        hover:border-orange-500 transition-all text-sm border-2"
                      initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                      style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                      animate={{ 
                        borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                        transition: { delay: 0.5, duration: 0.5 }
                      }}
                    >
                      <Mail className="h-4 w-4" />
                      Jakobbackhouse@gmail.com
                    </motion.a>
                    <motion.a
                      href="/cv/Jakob_Backhouse_CV.pdf"
                      download="Jakob_Backhouse_CV.pdf"
                      className="inline-flex items-center gap-2 bg-[#FFFFFF] px-3 py-1.5 text-black
                        hover:border-orange-500 transition-all text-sm border-2"
                      initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                      style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                      animate={{ 
                        borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                        transition: { delay: 0.55, duration: 0.5 }
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Download CV
                    </motion.a>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-6 md:p-8 relative z-10 transition-all duration-300"
                initial={{ 
                  opacity: 0, 
                  y: 0,
                  borderColor: 'rgba(0, 0, 0, 0)'
                }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                  borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                  transition: { 
                    duration: 0.3, 
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: 0.2
                  }
                }}
                whileHover={{ 
                  borderColor: '#f97316',
                  transition: { duration: 0.3 }
                }}
                drag={isDraggable}
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart('experience')}
                style={{ x: experienceX, y: experienceY, zIndex: zIndexes.experience }}
              >
                {isDraggable && <DragHandle />}
                <motion.div 
                  className="flex items-center gap-2 mb-3 border-b pb-2"
                  initial={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                  style={{ borderBottomColor: 'rgba(0, 0, 0, 0)' }}
                  animate={{ 
                    borderBottomColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)') : 'rgba(0, 0, 0, 0)',
                    transition: { delay: 0.5, duration: 0.5 }
                  }}
                >
                  <Briefcase className="h-4 w-4 text-primary/70 dark:text-primary-light/70" />
                  <h2 className="font-recoleta font-medium text-lg text-dark/70 dark:text-light/70">Experience</h2>
                </motion.div>
                <div className="space-y-3 font-satoshi">
                  <motion.div 
                    className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                    initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                    style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                                        animate={{ 
                        borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                        transition: { delay: 0.6, duration: 0.5 }
                      }}
                    whileHover={{ 
                      borderColor: '#f97316',
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className="bg-[#FFFFFF] text-black px-2 py-0.5 border-2">2021-2023</Badge>
                      <h3 className="font-bold text-dark dark:text-light">Learning and Motion Designer</h3>
                      <span className="text-secondary dark:text-secondary-light">AXIOM Training</span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="border-2 bg-[#F3F1E9] dark:bg-[#1A1818] p-2 transition-all duration-300"
                    initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                    style={{ borderColor: 'rgba(0, 0, 0, 0)' }}
                                        animate={{ 
                        borderColor: isLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                        transition: { delay: 0.7, duration: 0.5 }
                      }}
                    whileHover={{ 
                      borderColor: '#f97316',
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className="bg-[#FFFFFF] text-black px-2 py-0.5 border-2">2023-Now</Badge>
                      <h3 className="font-bold text-dark dark:text-light">UX Designer and Website Developer</h3>
                      <span className="text-secondary dark:text-secondary-light">MySafetyTV/Sharpdrive</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
                     </div>
        </main>
      </div>
  )
}

