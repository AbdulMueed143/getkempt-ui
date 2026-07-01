import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export — generates static HTML/CSS/JS files in the `out/` directory.
   * Compatible with: Cloudflare Pages, GitHub Pages, Netlify, S3, nginx, etc.
   */
  output: "export",

  /**
   * Image optimization requires a server. For static export, we serve
   * original images directly. Consider a CDN image service (Cloudflare
   * Images, Cloudinary) for production optimization.
   */
  images: {
    unoptimized: true,
  },

  /**
   * Base path for subdirectory deployments (e.g., /app).
   * Leave empty for root deployments (recommended for Cloudflare Pages).
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export default nextConfig;
