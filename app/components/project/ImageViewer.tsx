"use client"

import { useState, useEffect, useRef } from 'react'
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react'
import Image from 'next/image'

interface ImageViewerProps {
  src: string
  alt: string
  onClose: () => void
}

export default function ImageViewer({ src, alt, onClose }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [scale, setScale] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ 
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    optimalZoomLevel?: number;
  }>({ startX: 0, startY: 0, lastX: 0, lastY: 0 })

  useEffect(() => {
    const img = new window.Image()
    img.src = src
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const maxWidth = window.innerWidth * 0.95
      const maxHeight = window.innerHeight * 0.95
      
      let width = img.width
      let height = img.height

      // Store original dimensions for potential use in zooming
      const originalWidth = width
      const originalHeight = height

      // Scale down large images to fit viewport
      if (width > maxWidth) {
        width = maxWidth
        height = width / aspectRatio
      }
      
      if (height > maxHeight) {
        height = maxHeight
        width = height * aspectRatio
      }

      // Calculate optimal zoom level based on original image size
      const optimalZoomLevel = Math.min(3, Math.max(2, Math.min(
        originalWidth / width,
        originalHeight / height,
        4 // Cap maximum zoom at 4x
      )))

      setDimensions({ width, height })
      // Store optimal zoom level for later use
      setScale(1)
      // We'll use optimalZoomLevel when zooming in
      dragRef.current = {
        ...dragRef.current,
        optimalZoomLevel
      }
    }
  }, [src])

  const handleDragStart = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = {
      startX: e.pageX - position.x,
      startY: e.pageY - position.y,
      lastX: position.x,
      lastY: position.y
    };
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.pageX - dragRef.current.startX;
    const deltaY = e.pageY - dragRef.current.startY;
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  const handleZoomToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isZoomed) {
      setScale(1);
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 }); // Reset position when zooming out
    } else {
      // Use the optimal zoom level we calculated earlier, defaulting to 2 if not available
      const zoomLevel = dragRef.current.optimalZoomLevel || 2;
      setScale(zoomLevel);
      setIsZoomed(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-lg" // Increased z-index
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[70] p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handleZoomToggle}
        className="absolute top-4 right-16 z-[70] p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        {isZoomed ? (
          <ZoomOut className="w-6 h-6 text-white" />
        ) : (
          <ZoomIn className="w-6 h-6 text-white" />
        )}
      </button>

      {isZoomed && (
        <div className="absolute top-4 left-4 z-[70] flex items-center gap-2 text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
          <Move className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">Drag to pan</span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div 
          className={`
            relative transition-all duration-300 origin-center
            ${isDragging ? 'cursor-grabbing' : isZoomed ? 'cursor-grab' : 'cursor-zoom-in'}
          `}
          style={{ 
            width: dimensions.width, 
            height: dimensions.height,
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDragging) handleZoomToggle(e);
          }}
          onMouseDown={handleDragStart}
          onTouchStart={(e) => {
            if (!isZoomed) return;
            e.stopPropagation();
            setIsDragging(true);
            const touch = e.touches[0];
            dragRef.current = {
              startX: touch.pageX - position.x,
              startY: touch.pageY - position.y,
              lastX: position.x,
              lastY: position.y,
              optimalZoomLevel: dragRef.current.optimalZoomLevel
            };
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const deltaX = touch.pageX - dragRef.current.startX;
            const deltaY = touch.pageY - dragRef.current.startY;
            setPosition({ x: deltaX, y: deltaY });
          }}
          onTouchEnd={() => {
            setIsDragging(false);
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={src}
            alt={alt}
            fill
            quality={100}
            priority
            className={`
              object-contain transition-all duration-500
              ${isLoading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
            `}
            onLoadingComplete={() => setIsLoading(false)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
            unoptimized={true}
          />
        </div>
      </div>
      
      {/* Image information at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm max-w-[90%] truncate">
          {alt}
        </div>
      </div>
    </div>
  )
}
