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
    <div className="min-h-screen flex items-center justify-center bg-ground">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="retro-box p-8 bg-ground border border-line">
          <h2 className="font-display text-2xl mb-4 text-ink">
            Something went wrong!
          </h2>
          <p className="font-satoshi text-gray-600 dark:text-gray-300 mb-6">
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            className="retro-box px-6 py-3 font-satoshi text-lg text-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 bg-ground border border-line"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
} 