'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { useLoading } from '../../contexts/LoadingContext'

const PageTransition = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useLoading()

  return (
    <>
      {/* Blank loading bar visible during loading/transitions */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-[9999]" />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </>
  )
}

export default PageTransition
