"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const BackgroundSprites = () => {
  const [isClient, setIsClient] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
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
      observer.disconnect();
    };
  }, [])

  const sprites = [
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918322/ProjectReportIllustrationsArtboard-29_mur6gv.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918322/ProjectReportIllustrationsArtboard-22_g5lkx8.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918322/ProjectReportIllustrationsArtboard-30_qrjiw2.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918322/ProjectReportIllustrationsArtboard-28_xifl0l.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918321/ProjectReportIllustrationsArtboard-27_qvxh2s.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918321/ProjectReportIllustrationsArtboard-26_lm4z0r.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918305/ProjectReportIllustrationsArtboard-24_kajgjm.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918305/ProjectReportIllustrationsArtboard-20_ep58l8.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918305/ProjectReportIllustrationsArtboard-21_hebqgi.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918304/ProjectReportIllustrationsArtboard-19_fqfoji.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918301/ProjectReportIllustrationsArtboard-18_xf5swd.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918301/ProjectReportIllustrationsArtboard-17_baytmc.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918301/ProjectReportIllustrationsArtboard-15_gtlxxy.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918297/ProjectReportIllustrationsArtboard-9_ffukdr.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918297/ProjectReportIllustrationsArtboard-1_jkuit7.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918297/ProjectReportIllustrationsArtboard-12_iqvrex.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918297/ProjectReportIllustrationsArtboard-7_aj3jti.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918296/ProjectReportIllustrationsArtboard-4_kupud5.png',
    'https://res.cloudinary.com/donmpenyc/image/upload/v1750918296/ProjectReportIllustrationsArtboard-3_rs89rn.png'
  ]

  // Generate random positions for sprites (only on client side to avoid hydration mismatch)
  const [spritePositions, setSpritePositions] = useState<Array<{
    x: number
    y: number
    rotation: number
    scale: number
    index: number
  }>>([])

  useEffect(() => {
    if (isClient) {
              const generateEvenlyDistributedPositions = () => {
          const positions: Array<{
            x: number
            y: number
            rotation: number
            scale: number
            index: number
          }> = []
          
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
          const gridCols = 6
          const gridRows = 5
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
          for (let i = 0; i < Math.min(sprites.length, shuffledCells.length); i++) {
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
              scale: 1.8, // All sprites same much larger size
              index: i
            })
          }
          
          return positions
        }
      
              const positions = generateEvenlyDistributedPositions()
      setSpritePositions(positions)
    }
  }, [isClient, sprites.length])

  if (!isClient || spritePositions.length === 0) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden min-h-screen w-full">
      {/* SVG filter to remove white backgrounds */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="remove-white" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0  
              0 0 1 0 0
              -1 -1 -1 2 0"/>
          </filter>
          <filter id="remove-white-dark" x="0%" y="0%" width="100%" height="100%">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0  
              0 0 1 0 0
              -1 -1 -1 2 0"/>
          </filter>
        </defs>
      </svg>
      
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
             alt=""
             width={80}
             height={80}
             className="select-none"
             style={{
               filter: `url(#${isDarkMode ? 'remove-white-dark' : 'remove-white'}) drop-shadow(0 2px 4px rgba(0,0,0,0.1))`,
               maxWidth: '60px',
               maxHeight: '60px',
               width: 'auto',
               height: 'auto'
             }}
             loading="lazy"
             unoptimized // Since these are decorative background elements
           />
        </motion.div>
      ))}
    </div>
  )
}

export default BackgroundSprites 