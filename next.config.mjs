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
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting. framer-motion gets a higher priority so it
      // lands in its own cacheable chunk rather than the catch-all vendor one.
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 10,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 1,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
