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
  // Every page is <page>/index.html. Under a sub-path Next otherwise links the
  // home page as "/elcentroch" and loads its data from outside the site, and
  // without it my.html would sit next to a my/ folder, which static hosts
  // resolve differently. Sign-in emails link to the slash form too.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
