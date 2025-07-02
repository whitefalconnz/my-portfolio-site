"use client"

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  transitionState: 'entering' | 'visible' | 'exiting'
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

function LoadingProviderInner({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [transitionState, setTransitionState] = useState<'entering' | 'visible' | 'exiting'>('entering')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initial page load
    setTimeout(() => setTransitionState('visible'), 100)
    const timer = setTimeout(() => {
      setTransitionState('exiting')
      setTimeout(() => {
        setIsLoading(false)
      }, 600)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && (pathname || searchParams)) {
      // Immediately hide content and show loading
      setIsLoading(true)
      setTransitionState('entering')
      
      // Show loading animation
      setTimeout(() => setTransitionState('visible'), 100)
      const timer = setTimeout(() => {
        setTransitionState('exiting')
        setTimeout(() => {
          setIsLoading(false)
        }, 600)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      transitionState 
    }}>
      {children}
    </LoadingContext.Provider>
  )
}

// Simple Suspense fallback without the orange cube
function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1818]">
      <div className="text-center">
        <div className="loading-text text-black dark:text-white">
          Loading
          <span className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <LoadingProviderInner>{children}</LoadingProviderInner>
    </Suspense>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
