"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"
import ScrollReveal from "../animations/ScrollReveal"
import { useHero } from "../../contexts/HeroContext"
import { useLoading } from "../../contexts/LoadingContext"

export default function HeroSection() {
  const [contentLoaded, setContentLoaded] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showScrollIndicator, setShowScrollIndicator] = useState(true)
  const [showTextOverlay, setShowTextOverlay] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { showHero, setHeroHeight } = useHero()
  const { isLoading } = useLoading()

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    }

    // Initial check
    checkDarkMode()
    setContentLoaded(true)

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Update hero height when component mounts/updates
  useEffect(() => {
    if (sectionRef.current) {
      const height = sectionRef.current.offsetHeight
      setHeroHeight(height)
    }
  }, [setHeroHeight])

  // Handle scroll indicator visibility
  useEffect(() => {
    if (!showHero) return

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false)
      } else {
        setShowScrollIndicator(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showHero])

  // Handle hero section click to toggle text overlay
  const handleHeroClick = () => {
    setShowTextOverlay(prev => {
      if (prev) {
        // If hiding, mark that initial load is done
        setIsInitialLoad(false)
      }
      return !prev
    })
  }

  // Handle sound toggle
  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the hero click
    setIsSoundOn(prev => {
      const newSoundState = !prev
      if (videoRef.current) {
        videoRef.current.muted = !newSoundState
      }
      return newSoundState
    })
  }

  // Don't render if hero shouldn't be shown or during loading
  if (!showHero || isLoading) {
    return null
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
              borderColor: 'rgba(0, 0, 0, 0)'
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              borderColor: contentLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
              transition: { 
                duration: 0.8, 
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.8 // Wait for page transition (0.5s) + original delay (0.3s)
              }
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={!isSoundOn}
              playsInline
              webkit-playsinline="true"
              className="w-full h-[90vh] object-cover"
              poster="https://res.cloudinary.com/donmpenyc/video/upload/v1750915229/TagFullInitial_nyxuqe.jpg"
              preload="auto"
            >
              <source src="https://res.cloudinary.com/donmpenyc/video/upload/v1750915229/TagFullInitial_nyxuqe.mp4" type="video/mp4" />
              <source src="https://res.cloudinary.com/donmpenyc/video/upload/v1750915229/TagFullInitial_nyxuqe.webm" type="video/webm" />
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
                  delay: 2.0 // Appear after other elements
                }
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
                      delay: isInitialLoad ? 1.3 : 0 // Only delay on initial load
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    transition: { 
                      duration: 0.5,
                      ease: "easeOut"
                    }
                  }}
                >
                  <motion.div 
                    className="text-center p-6 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2"
                    initial={{ 
                      y: isInitialLoad ? 20 : 0,
                      opacity: 0,
                      borderColor: 'rgba(0, 0, 0, 0)'
                    }}
                    animate={{ 
                      y: 0,
                      opacity: 1,
                      borderColor: contentLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)') : 'rgba(0, 0, 0, 0)',
                      transition: { 
                        duration: isInitialLoad ? 0.6 : 0.2,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: isInitialLoad ? 1.5 : 0 // Only delay on initial load
                      }
                    }}
                    exit={{
                      y: -10,
                      opacity: 0,
                      scale: 0.95,
                      transition: { 
                        duration: 0.4,
                        ease: "easeOut"
                      }
                    }}
                  >
                    <h1 className="font-recoleta text-2xl md:text-4xl lg:text-5xl text-primary dark:text-primary-light mb-2">
                      Welcome to my portfolio
                    </h1>
                    <p className="font-satoshi text-sm md:text-base text-secondary dark:text-secondary-light">
                      Animation • Design • Storytelling
                    </p>
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
                delay: 2.0 // Wait for page transition (0.5s) + original delay (1.5s)
              }
            }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.3 } }}
          >
            <motion.div 
              className="w-6 h-10 border-2 rounded-full flex justify-center"
              initial={{ borderColor: 'rgba(0, 0, 0, 0)' }}
              animate={{ 
                borderColor: contentLoaded ? (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)') : 'rgba(0, 0, 0, 0)',
                transition: { delay: 2.0, duration: 0.5 } // Wait for page transition (0.5s) + original delay (1.5s)
              }}
            >
              <motion.div 
                className="w-1 h-3 bg-black dark:bg-white rounded-full mt-2"
                animate={{ 
                  y: [0, 12, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
} 