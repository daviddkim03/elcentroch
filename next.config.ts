import type { NextConfig } from "next";

// Set to e.g. "/elcentroch" to serve the site from a sub-path, as on GitHub
// Pages (the deploy workflow sets it). Unset serves it from the domain root.
// src/lib/base-path.ts applies the same value to plain URLs.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static export: every page is pre-rendered to plain HTML at build time and
  // the dynamic parts (hero slides, admin) talk to Supabase from the browser,
  // so `out/` can be hosted on any static host.
  output: "export",
  basePath,
  // Under a sub-path, links to the home page come out as "/elcentroch", and
  // Next then loads that page's data from "/elcentroch.txt", outside the site.
  // Trailing slashes put every page and its data at <page>/index.html and
  // <page>/index.txt. At a domain root, URLs stay "/about" like the original.
  trailingSlash: basePath !== "",
  images: { unoptimized: true },
};

export default nextConfig;
