"use client";

import { motion, useScroll } from "framer-motion";

/**
 * Displays a 100%-width progress bar that scales horizontally
 * according to the window scroll progress. Uses framer-motion
 * for a single, highly-performant transform.
 */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-primary dark:bg-primary-light z-[9999] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export default ScrollProgressBar; 