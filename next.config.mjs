/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages
  output: 'standalone',
  // Ensure proper image handling
  images: {
    unoptimized: true,
  },
};

export default nextConfig; 