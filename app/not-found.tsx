import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1818]">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="retro-box p-8 bg-white dark:bg-[#1A1818] border-2 border-black dark:border-white">
          <h2 className="font-recoleta text-4xl mb-4 text-black dark:text-white">
            404
          </h2>
          <h3 className="font-recoleta text-xl mb-4 text-black dark:text-white">
            Page Not Found
          </h3>
          <p className="font-satoshi text-gray-600 dark:text-gray-300 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="retro-box px-6 py-3 font-satoshi text-lg text-black dark:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-300 bg-white dark:bg-[#1A1818] border-2 border-black dark:border-white inline-block"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
} 