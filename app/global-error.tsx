'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-ground">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="retro-box p-8 bg-ground border border-line">
              <h2 className="font-display text-2xl mb-4 text-ink">
                Something went wrong!
              </h2>
              <p className="font-satoshi text-gray-600 dark:text-gray-300 mb-6">
                A global error occurred. Please refresh the page.
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
      </body>
    </html>
  )
} 