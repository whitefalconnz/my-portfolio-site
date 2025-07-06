"use client"

import { useEffect, useRef, useCallback } from 'react'
import { useLoading } from '../../contexts/LoadingContext'

export default function SparkEffect() {
  const { isLoading } = useLoading()
  const sparkCount = useRef(0)
  const maxSparks = 50 // Limit total sparks to prevent memory issues
  const sparkPool = useRef<HTMLDivElement[]>([])

  // Create spark with optimized performance
  const createSpark = useCallback((e: MouseEvent) => {
    // Don't create sparks if too many exist or during loading
    if (isLoading || sparkCount.current >= maxSparks) return
    
    // Reduce particle count on mobile
    const isMobile = window.innerWidth <= 768
    const numParticles = isMobile ? 
      Math.floor(Math.random() * 3) + 3 : // 3-5 particles on mobile
      Math.floor(Math.random() * 4) + 6   // 6-9 particles on desktop
    
    for (let i = 0; i < numParticles; i++) {
      if (sparkCount.current >= maxSparks) break
      
      // Reuse spark from pool if available
      let spark: HTMLDivElement
      if (sparkPool.current.length > 0) {
        spark = sparkPool.current.pop()!
        spark.style.display = 'block'
      } else {
        spark = document.createElement('div')
        spark.className = 'retro-spark'
      }
      
      const angleOptions = [0, 45, 90, 135, 180, 225, 270, 315]
      const angle = angleOptions[Math.floor(Math.random() * angleOptions.length)]
      const size = 3 + Math.floor(Math.random() * 4) // Smaller size for better performance
      
      spark.style.position = 'fixed'
      spark.style.left = `${e.clientX - size / 2}px`
      spark.style.top = `${e.clientY - size / 2}px`
      spark.style.width = `${size}px`
      spark.style.height = `${size}px`
      spark.style.setProperty('--angle', `${angle}deg`)
      spark.style.setProperty('--distance', `${20 + Math.random() * 30}px`) // Shorter distance
      
      document.body.appendChild(spark)
      sparkCount.current++
      
      const cleanup = () => {
        spark.remove()
        spark.style.display = 'none'
        sparkPool.current.push(spark)
        sparkCount.current--
        spark.removeEventListener('animationend', cleanup)
      }
      
      spark.addEventListener('animationend', cleanup)
    }
  }, [isLoading])

  useEffect(() => {
    // Don't add event listeners during loading
    if (isLoading) return
    
    // Throttle spark creation for better performance
    let timeoutId: NodeJS.Timeout
    const throttledCreateSpark = (e: MouseEvent) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => createSpark(e), 50) // 50ms throttle
    }

    // Add click handler to document after component mounts
    if (typeof window !== 'undefined') {
      document.addEventListener('click', throttledCreateSpark)
      return () => {
        document.removeEventListener('click', throttledCreateSpark)
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, createSpark])

  // Don't render during loading
  if (isLoading) {
    return null
  }

  return (
    <div id="spark-effect-container" style={{ 
      position: 'fixed', 
      inset: 0, 
      pointerEvents: 'none', 
      zIndex: 9999 
    }} />
  )
}