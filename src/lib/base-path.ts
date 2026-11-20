// The sub-path the site is served from: "/elcentroch" on GitHub Pages
// (https://<user>.github.io/<repo>/), empty at a domain root. next.config.ts
// gives the same value to Next, which adds it to <Link> hrefs and its own
// /_next/ files, but not to plain URLs such as <img src> or <a href>: build
// those with withBasePath().
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: `/${string}`): string {
  return basePath + path;
}
