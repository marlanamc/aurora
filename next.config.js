/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL FOR TAURI: Export as static site
  // Tauri can't run a Node.js server - it needs pre-built HTML/CSS/JS files
  output: 'export',

  // Disable image optimization since we're using static export
  // We'll handle images ourselves or use next/image with a custom loader
  images: {
    unoptimized: true,
  },

  // No trailing slashes for cleaner URLs
  trailingSlash: false,

  // During development, we'll use Next.js dev server
  // In production build, Tauri will serve the 'out' directory
  distDir: 'out',
}

module.exports = nextConfig
