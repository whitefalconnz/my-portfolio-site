'use client'

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '../utils/cn';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  variant?: 'title' | 'description' | 'fast' | 'instant';
  disablePixels?: boolean;
}

export default function AnimatedText({ 
  text, 
  className, 
  delay = 0, 
  variant = 'title',
  disablePixels = false 
}: AnimatedTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const pixelsCreated = useRef(false);

  // Optimize pixel creation by limiting number and improving performance
  const createPixels = (charElement: HTMLSpanElement, charDelay: number) => {
    // Skip pixels for better performance if disabled or we've already created them for this component
    if (disablePixels || pixelsCreated.current) return;
    
    const rect = charElement.getBoundingClientRect();
    
    // Only create pixels for every 4th character to improve performance
    if (Math.random() > 0.25) return;
    
    // Reduce number of pixels
    const numPixels = 3; // Reduced from 5 to 3
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < numPixels; i++) {
          const pixel = document.createElement('div');
          pixel.className = 'text-pixel';
          
          const angle = (Math.random() * Math.PI * 2);
          const distance = Math.random() * 15 + 5; // Reduced from 20+10 to 15+5
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          
          pixel.style.setProperty('--tx', `${tx}px`);
          pixel.style.setProperty('--ty', `${ty}px`);
          pixel.style.left = `${rect.left + rect.width / 2}px`;
          pixel.style.top = `${rect.top + rect.height / 2}px`;
          pixel.style.backgroundColor = 'var(--spark-color)';
          
          fragment.appendChild(pixel);
          
          // Set a timeout to remove the pixel
          setTimeout(() => pixel.remove(), 400); // Reduced from 500ms to 400ms
        }
        
        document.body.appendChild(fragment);
      }, charDelay);
    });
  };

  useEffect(() => {
    // Use shorter delay for instant animation - useful for initial page load
    const effectiveDelay = variant === 'instant' ? 0 : delay;
    
    const timeout = setTimeout(() => {
      setIsVisible(true);
      
      // Mark that we've created pixels for this text
      pixelsCreated.current = true;
      
      if (containerRef.current) {
        const chars = containerRef.current.querySelectorAll('.char');
        chars.forEach((char, index) => {
          // Faster timing for all animations
          const charDelay = effectiveDelay + (index * (
            variant === 'title' ? 20 : // Reduced from 30 to 20
            variant === 'description' ? 5 : // Reduced from 8 to 5
            variant === 'instant' ? 0 : // No delay for instant 
            1 // Fast variant
          ));
          
          // Skip pixel creation for instant variant
          if (variant !== 'instant') {
            createPixels(char as HTMLSpanElement, charDelay);
          }
        });
      }
    }, effectiveDelay);

    return () => clearTimeout(timeout);
  }, [delay, variant, disablePixels]);

  // Calculate animation duration based on variant
  const getDuration = () => {
    switch (variant) {
      case 'title': return '300ms'; // Reduced from 400ms
      case 'description': return '80ms'; // Reduced from 100ms
      case 'fast': return '10ms';
      case 'instant': return '0ms';
      default: return '300ms';
    }
  };

  // Calculate delay multiplier based on variant
  const getDelayMultiplier = () => {
    switch (variant) {
      case 'title': return 20; // Reduced from 30
      case 'description': return 5; // Reduced from 8
      case 'fast': return 1;
      case 'instant': return 0;
      default: return 20;
    }
  };

  const duration = getDuration();
  const delayMultiplier = getDelayMultiplier();

  return (
    <span ref={containerRef} className={cn("inline-block relative", className)}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={`char inline-block opacity-0 transition-all duration-[${duration}] ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[5px]'
          }`}
          style={{
            transitionDelay: `${delay + (index * delayMultiplier)}ms`,
            willChange: 'opacity, transform',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
