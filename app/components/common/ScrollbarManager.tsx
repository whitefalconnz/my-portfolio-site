"use client"

import { useEffect, useState } from 'react'
import { useLoading } from '../../contexts/LoadingContext'

export default function ScrollbarManager() {
  const { isLoading } = useLoading()
  const [showNormalScrollbar, setShowNormalScrollbar] = useState(false)

  useEffect(() => {
    console.log('ScrollbarManager: isLoading changed to', isLoading)
    
    if (!isLoading) {
      console.log('ScrollbarManager: Starting 2 second timer for normal scrollbar')
      // Add a delay so scrollbar changes to home screen style after header and other elements have settled
      const timer = setTimeout(() => {
        console.log('ScrollbarManager: 2 seconds passed, showing normal scrollbar')
        setShowNormalScrollbar(true)
      }, 2000) // 2 seconds delay after loading completes
      
      return () => clearTimeout(timer)
    } else {
      // Reset when loading starts again
      console.log('ScrollbarManager: Loading started, hiding normal scrollbar')
      setShowNormalScrollbar(false)
    }
  }, [isLoading])

  useEffect(() => {
    const html = document.documentElement
    
    if (isLoading || !showNormalScrollbar) {
      // During loading or before the delay completes, use loading-state styles
      console.log('ScrollbarManager: Adding loading-state class')
      html.classList.add('loading-state')
    } else {
      // After loading completes and delay passes, switch to normal home screen scrollbar
      console.log('ScrollbarManager: Removing loading-state class, showing normal scrollbar')
      html.classList.remove('loading-state')
    }

    // Cleanup on unmount
    return () => {
      html.classList.remove('loading-state')
    }
  }, [isLoading, showNormalScrollbar])

  // This component doesn't render anything visible
  return null
} 