"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useScrollInView } from '../hooks/useScrollInView'

interface BlurImageProps {
  src: string
  alt: string
  width: number
  height: number
  quality?: number
  priority?: boolean
  className?: string
  sizes?: string
  unoptimized?: boolean
  onClick?: () => void
}

export default function BlurImage({
  src,
  alt,
  width,
  height,
  quality = 100,
  priority = false,
  className = "",
  sizes = "(max-width: 1280px) 100vw, 70vw",
  unoptimized = true,
  onClick
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  const { ref, isInView } = useScrollInView({
    threshold: 0.1,
    triggerOnce: true
  })

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Simulate loading progress
  useEffect(() => {
    if (!isInView && !priority) return
    
    let interval: NodeJS.Timeout
    if (!isLoaded) {
      // Start at initial blur level
      setLoadingProgress(10)
      
      // Simulate progressive loading by gradually reducing blur
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 10
          return newProgress < 70 ? newProgress : 70  // Cap at 70% until actual load completes
        })
      }, 200)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isInView, isLoaded, priority])

  // Create a simple blurred placeholder using base64 directly
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTAxMDEwIi8+PC9zdmc+'

  // Calculate blur amount based on loading progress
  const blurAmount = isLoaded ? 0 : Math.max(20 - (loadingProgress / 5), 0)

  return (
    <div ref={ref} className="relative w-auto h-auto max-w-full max-h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse opacity-30"></div>
      )}
      {(isInView || priority) && (
        <Image
          src={src}
          alt={alt}
          width={isMobile ? Math.min(width, 1280) : width}
          height={isMobile ? Math.min(height, 720) : height}
          quality={isMobile ? Math.min(quality, 75) : quality}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className={`${className} transition-all duration-300 ease-in-out`}
          style={{
            opacity: isLoaded ? 1 : (0.4 + loadingProgress / 100 * 0.6),
            filter: `blur(${blurAmount}px)`
          }}
          sizes={sizes}
          unoptimized={unoptimized}
          onClick={onClick}
          onLoadingComplete={() => {
            setIsLoaded(true)
            setLoadingProgress(100)
          }}
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  )
} 