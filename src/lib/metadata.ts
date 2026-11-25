import type { Metadata } from "next";

// Social sites need a full address. The site is served from here on GitHub Pages.
export const ogImage = "https://daviddkim03.github.io/elcentroch/images/social.png";

/**
 * The tags the original sets on each page. A page's `openGraph` / `twitter`
 * objects replace the root layout's rather than merging, so the shared type,
 * card and image are repeated here.
 */
export function pageMetadata({
  title,
  description,
  ogDescription,
}: {
  title: string;
  description: string;
  ogDescription: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: { type: "website", title, description: ogDescription, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description: ogDescription, images: [ogImage] },
  };
}
