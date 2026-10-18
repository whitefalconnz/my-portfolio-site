/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization for better performance
  images: {
    unoptimized: false, // Enable Next.js image optimization
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'media.jakobbackhouse.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Enable compression
  compress: true,
  // Strip console output from production bundles, keeping error/warn for triage
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },
  // Enable experimental features for better performance
  experimental: {
    // Temporarily disabled optimizeCss to fix deployment issues
    // optimizeCss: true,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // No custom splitChunks. An override here used to force every node_modules
  // package into one `vendors` chunk, so /about and /contact downloaded the
  // home page's grid and modal libraries too. Next's own chunking is
  // per-route and is the better default.

  // /home was a "coming soon" placeholder that search engines could index as
  // a thin duplicate of the home page. Send it, and any old links, to /.
  async redirects() {
    return [{ source: '/home', destination: '/', permanent: true }];
  },

};

export default nextConfig;
