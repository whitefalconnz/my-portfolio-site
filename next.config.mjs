/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: 'https', hostname: 'media.jakobbackhouse.com' },
      // Thumbnails for the Vimeo films that have no poster of their own.
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
    ],
  },
  compress: true,
  // Strip console output from production bundles, keeping error/warn for triage
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
  },

  // The site is one page now. Old links to the separate About and Contact
  // pages land on the same thing, opened, on the home page. /home was a
  // placeholder that search engines could index as a thin duplicate.
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
    ];
  },

  // Files in public/videos, and the runner's drawings, carry their version in
  // the name, so a new export gets a new URL and browsers never need to
  // re-check the old one.
  async headers() {
    const forever = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ];
    return [
      { source: '/videos/:path*', headers: forever },
      { source: '/runner-v01.webp', headers: forever },
    ];
  },
};

export default nextConfig;
