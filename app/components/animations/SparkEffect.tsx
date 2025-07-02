"use client"

import { useEffect } from 'react'
import { useLoading } from '../../contexts/LoadingContext'

export default function SparkEffect() {
  const { isLoading } = useLoading()

  useEffect(() => {
    // Don't add event listeners during loading
    if (isLoading) return
    const createSpark = (e: MouseEvent) => {
      const numParticles = Math.floor(Math.random() * 6) + 8;
      
      for (let i = 0; i < numParticles; i++) {
        const spark = document.createElement('div')
        spark.className = 'retro-spark'
        
        const angleOptions = [0, 45, 90, 135, 180, 225, 270, 315]
        const angle = angleOptions[Math.floor(Math.random() * angleOptions.length)]
        const size = 4 + Math.floor(Math.random() * 5)
        
        spark.style.position = 'fixed'
        spark.style.left = `${e.clientX - size / 2}px`
        spark.style.top = `${e.clientY - size / 2}px`
        spark.style.width = `${size}px`
        spark.style.height = `${size}px`
        spark.style.setProperty('--angle', `${angle}deg`)
        spark.style.setProperty('--distance', `${30 + Math.random() * 40}px`)
        
        document.body.appendChild(spark)
        
        const cleanup = () => {
          spark.remove()
          spark.removeEventListener('animationend', cleanup)
        }
        
        spark.addEventListener('animationend', cleanup)
      }
    }

    // Add click handler to document after component mounts
    if (typeof window !== 'undefined') {
      document.addEventListener('click', createSpark)
      return () => document.removeEventListener('click', createSpark)
    }
  }, [isLoading])

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