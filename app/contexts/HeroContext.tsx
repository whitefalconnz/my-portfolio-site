'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface HeroContextType {
  showHero: boolean
  setShowHero: (show: boolean) => void
  isFirstLoad: boolean
  heroHeight: number
  setHeroHeight: (height: number) => void
}

const HeroContext = createContext<HeroContextType | undefined>(undefined)

export function HeroProvider({ children }: { children: ReactNode }) {
  const [showHero, setShowHero] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [heroHeight, setHeroHeight] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    // Only show hero on home page
    if (pathname === '/') {
      // On first load, show hero temporarily then hide it
      if (isFirstLoad) {
        setShowHero(true)
      } else {
        // On subsequent visits, hide hero unless user scrolls up
        setShowHero(false)
      }
    } else {
      // Hide hero on other pages
      setShowHero(false)
    }
  }, [pathname, isFirstLoad])

  // Handle initial scroll positioning when hero height is available
  useEffect(() => {
    if (pathname === '/' && isFirstLoad && heroHeight > 0) {
      // Estimate header height (typically around 100px)
      const headerHeight = 100
      // Scroll to the content position (below header + hero) on first load
      setTimeout(() => {
        window.scrollTo({
          top: headerHeight + heroHeight,
          behavior: 'instant'
        })
        // Hide hero after initial scroll for subsequent navigation
        setShowHero(false)
        setIsFirstLoad(false)
      }, 200)
    }
  }, [pathname, isFirstLoad, heroHeight])

  // Listen for scroll to show/hide hero on home page (for subsequent visits)
  useEffect(() => {
    if (pathname !== '/' || isFirstLoad) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const headerHeight = 100 // Estimate header height
      // Show hero when scrolled to top area (within hero section bounds, accounting for header)
      const shouldShow = scrollY < (headerHeight + heroHeight * 0.5)
      if (shouldShow !== showHero) {
        setShowHero(shouldShow)
      }
    }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname, heroHeight, showHero, isFirstLoad])

  return (
    <HeroContext.Provider value={{ 
      showHero, 
      setShowHero, 
      isFirstLoad, 
      heroHeight, 
      setHeroHeight 
    }}>
      {children}
    </HeroContext.Provider>
  )
}

export function useHero() {
  const context = useContext(HeroContext)
  if (context === undefined) {
    throw new Error('useHero must be used within a HeroProvider')
  }
  return context
} 