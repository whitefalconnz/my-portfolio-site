"use client";

import { motion, useScroll } from "framer-motion";
import { useLoading } from '../../contexts/LoadingContext';
import { useState, useEffect } from 'react';

/**
 * Displays a 100%-width progress bar that scales horizontally
 * according to the window scroll progress. Uses framer-motion
 * for a single, highly-performant transform.
 */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const { isLoading } = useLoading();
  const [showScrollBar, setShowScrollBar] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Add a longer delay so header fully settles before scroll bar appears
      const timer = setTimeout(() => {
        setShowScrollBar(true);
      }, 600); // 600ms delay after loading completes
      
      return () => clearTimeout(timer);
    } else {
      // Reset when loading starts again
      setShowScrollBar(false);
    }
  }, [isLoading]);

  // Don't render during loading or before the delay
  if (isLoading || !showScrollBar) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-primary dark:bg-primary-light z-[9999] origin-left"
      style={{ scaleX: scrollYProgress }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        delay: 0.2
      }}
    />
  );
};

export default ScrollProgressBar; 