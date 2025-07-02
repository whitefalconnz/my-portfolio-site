'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1818]">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="retro-box p-8 bg-white dark:bg-[#1A1818] border-2 border-black dark:border-white">
          <h2 className="font-recoleta text-2xl mb-4 text-black dark:text-white">
            Something went wrong!
          </h2>
          <p className="font-satoshi text-gray-600 dark:text-gray-300 mb-6">
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            className="retro-box px-6 py-3 font-satoshi text-lg text-black dark:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 bg-white dark:bg-[#1A1818] border-2 border-black dark:border-white"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
} 