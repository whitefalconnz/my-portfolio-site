import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ground">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="retro-box p-8 bg-ground border border-line">
          <h2 className="font-display text-4xl mb-4 text-ink">
            404
          </h2>
          <h3 className="font-display text-xl mb-4 text-ink">
            Page Not Found
          </h3>
          <p className="font-satoshi text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="retro-box px-6 py-3 font-satoshi text-lg text-ink hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 bg-ground border border-line inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
} 