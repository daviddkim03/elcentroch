import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: every page is pre-rendered to plain HTML at build time and
  // the dynamic parts (hero slides, admin) talk to Supabase from the browser,
  // so `out/` can be hosted on any static host.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
