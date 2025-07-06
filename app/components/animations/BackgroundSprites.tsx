"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const BackgroundSprites = () => {
  const [isClient, setIsClient] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setIsClient(true)
    
    // Detect mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                    'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0
      setIsMobile(mobile)
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Check dark mode
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Set up observer for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('resize', checkMobile)
      observer.disconnect();
    };
  }, [])

  // Updated sprite list with new URLs
  const sprites = useMemo(() => [
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767946/ProjectReportIllustrationsArtboard-30_pwhlbh.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767946/ProjectReportIllustrationsArtboard-29_dso2tt.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767946/ProjectReportIllustrationsArtboard-28_osm15p.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767945/ProjectReportIllustrationsArtboard-27_mx7uig.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767932/ProjectReportIllustrationsArtboard-26_qtlabv.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767931/ProjectReportIllustrationsArtboard-24_a0u8dq.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767931/ProjectReportIllustrationsArtboard-25_xulv0o.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767931/ProjectReportIllustrationsArtboard-23_cunapb.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767930/ProjectReportIllustrationsArtboard-22_kdja6d.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767913/ProjectReportIllustrationsArtboard-20_xwpc93.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767914/ProjectReportIllustrationsArtboard-21_ru7jrd.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767913/ProjectReportIllustrationsArtboard-19_xsf2wf.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767913/ProjectReportIllustrationsArtboard-18_ykzmuc.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767911/ProjectReportIllustrationsArtboard-17_qkkkcu.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767911/ProjectReportIllustrationsArtboard-16_tkdn21.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767910/ProjectReportIllustrationsArtboard-15_psepvt.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767910/ProjectReportIllustrationsArtboard-14_cyn1oj.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-10_ftjvse.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-12_w0r0ey.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-11_qupmdh.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-13_euwuv3.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-9_tjajhm.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767907/ProjectReportIllustrationsArtboard-8_axuaun.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-4_nyx3ad.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-5_sxuh8f.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-3_yiocbj.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-6_p2rzfq.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-7_zxxtcn.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1751767906/ProjectReportIllustrationsArtboard-2_awnacf.png'
  ], [])

  // Generate optimized positions with reduced sprites on mobile
  const [spritePositions, setSpritePositions] = useState<Array<{
    x: number
    y: number
    rotation: number
    scale: number
    index: number
  }>>([])

  const generateOptimizedPositions = useCallback(() => {
    const positions: Array<{
      x: number
      y: number
      rotation: number
      scale: number
      index: number
    }> = []
    
    // Reduce sprite count on mobile for better performance
    const maxSprites = isMobile ? 8 : 18
    const availableSprites = sprites.slice(0, maxSprites)
    
    // Content exclusion zones (areas to avoid)
    const exclusionZones = [
      { x: 15, y: 10, width: 70, height: 80 }, // Main content area
    ]
    
    const checkExclusionZone = (pos: { x: number, y: number }) => {
      for (const zone of exclusionZones) {
        if (pos.x >= zone.x && pos.x <= zone.x + zone.width &&
            pos.y >= zone.y && pos.y <= zone.y + zone.height) {
          return true
        }
      }
      return false
    }
    
    // Create a flexible grid system for even distribution
    const gridCols = isMobile ? 4 : 6
    const gridRows = isMobile ? 3 : 5
    const cellWidth = 100 / gridCols
    const cellHeight = 100 / gridRows
    
    // Create available grid cells (avoiding content areas)
    const availableCells: Array<{ gridX: number, gridY: number }> = []
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const cellCenterX = col * cellWidth + cellWidth / 2
        const cellCenterY = row * cellHeight + cellHeight / 2
        
        // Check if this cell overlaps with exclusion zones
        if (!checkExclusionZone({ x: cellCenterX, y: cellCenterY })) {
          availableCells.push({ gridX: col, gridY: row })
        }
      }
    }
    
    // Shuffle available cells for randomness
    const shuffledCells = [...availableCells].sort(() => Math.random() - 0.5)
    
    // Place sprites in available cells
    for (let i = 0; i < Math.min(availableSprites.length, shuffledCells.length); i++) {
      const cell = shuffledCells[i]
      
      // Calculate base position from grid
      const baseX = cell.gridX * cellWidth + cellWidth / 2
      const baseY = cell.gridY * cellHeight + cellHeight / 2
      
      // Add random offset within the cell for organic feel (±30% of cell size)
      const offsetX = (Math.random() - 0.5) * cellWidth * 0.6
      const offsetY = (Math.random() - 0.5) * cellHeight * 0.6
      
      const finalX = Math.max(2, Math.min(98, baseX + offsetX))
      const finalY = Math.max(2, Math.min(98, baseY + offsetY))
      
      positions.push({
        x: finalX,
        y: finalY,
        rotation: 0,
        scale: isMobile ? 1.2 : 1.8, // Smaller scale on mobile
        index: i
      })
    }
    
    return positions
  }, [sprites.length, isMobile])

  useEffect(() => {
    if (isClient) {
      const positions = generateOptimizedPositions()
      setSpritePositions(positions)
    }
  }, [isClient, generateOptimizedPositions])

  // Don't render on mobile for better performance
  if (!isClient || spritePositions.length === 0 || isMobile) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden min-h-screen w-full">
      {spritePositions.map((position, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: `translate(-50%, -50%) scale(${position.scale})`,
          }}
          animate={{
            x: [0, 2, -1, 3, 0], // Subtle boiling movement
            y: [0, -2, 1, -3, 0],
            scale: [
              position.scale,
              position.scale * 1.02,
              position.scale * 0.98,
              position.scale * 1.01,
              position.scale
            ]
          }}
          transition={{
            duration: 3 + Math.random() * 2, // Random duration between 3-5 seconds
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2 // Random delay to stagger animations
          }}
        >
          <Image
            src={sprites[position.index]}
            alt="Background decoration"
            width={64}
            height={64}
            className="w-16 h-16"
            style={{
              imageRendering: 'pixelated'
            }}
            priority={false}
            loading="lazy"
            sizes="64px"
            quality={30} // Lower quality for background sprites
          />
        </motion.div>
      ))}
    </div>
  )
}

export default BackgroundSprites 