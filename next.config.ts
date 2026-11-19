import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the whole site is client-rendered (like the Lovable original),
  // so it can be hosted anywhere (Vercel, Netlify, Cloudflare Pages, S3...).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
