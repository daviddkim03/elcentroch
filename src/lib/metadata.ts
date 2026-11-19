import type { Metadata } from "next";

// The social preview image configured in the Lovable project (hosted on Lovable's CDN).
export const ogImage =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/lovp_15f5vfv3tn8cjb68fwj6c9nz8c/c02c6834fe328c2f88c0df10c0b83d8b_1793559221530.png";

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
