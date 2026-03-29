import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Static export — required for GitHub Pages (gh-pages -d out).
   * `next build` will write all pages to the `out/` directory.
   */
  output: "export",

  /**
   * Next.js Image optimisation is a server-side feature and cannot run
   * in a statically exported site. Setting unoptimized keeps <Image>
   * working by serving the original files directly.
   */
  images: {
    unoptimized: true,
  },

  /**
   * If your GitHub Pages site lives at a sub-path
   * (e.g. https://username.github.io/getsquire) set this env variable
   * before building:
   *   NEXT_PUBLIC_BASE_PATH=/getsquire npm run deploy
   *
   * For a root deployment (username.github.io) leave it unset.
   */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

export default nextConfig;
