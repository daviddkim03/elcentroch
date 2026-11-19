# El Centro Korean Church website

Source code for https://elcentro.lovable.app, rebuilt outside Lovable with the same
design: the navy + gold colors, fonts, layout, copy, 한국어 / EN toggle, hero slider,
404 page and the `/admin` slide manager. Automated screenshot comparisons against the
live Lovable site (every public page and the admin sign-in screen, at desktop, laptop,
tablet and phone widths, in Korean and English, plus hover, scroll, menu and toast
states) came out pixel-identical.

Stack: Next.js 15 (App Router, static export), React 19, Tailwind CSS v4,
shadcn/ui components, lucide-react icons, sonner toasts, Supabase.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and deploy

```bash
npm run build      # writes the static site to out/
```

Every page is pre-rendered to plain HTML (`out/about.html` is served at `/about`), so `out/`
can go on any static host with clean URLs: Vercel, Netlify, Cloudflare Pages, GitHub Pages
or Firebase Hosting. On Vercel, just import the repo.

## Supabase (hero slides and admin)

The site uses the same Supabase project as the Lovable version, so slides you manage at
`/admin` show up on the home page. `.env` holds its URL and publishable key; both are public
by design (they ship in the browser bundle, and row-level security protects the data). If
they are missing, the site still works and shows the three built-in slides.

What the code expects in Supabase:

- `hero_slides` table: `id`, `image_url`, `title_ko`, `title_en`, `subtitle_ko`, `subtitle_en`, `sort_order`
- `hero` storage bucket for uploaded images
- `has_role(_user_id, _role)` function, used to check that a signed-in user is an admin

When you deploy to a new domain, add it under Supabase > Authentication > URL Configuration
so admin sign-up emails link back to the right site.

## Structure

- `src/app/*/page.tsx`: one file per page, including its title and description
- `src/app/admin/`: slide manager (sign in, upload, reorder, captions)
- `src/app/not-found.tsx`, `src/app/error.tsx`: 404 and error pages
- `src/components/`: header, footer, hero slider, page shell, shadcn `ui/` primitives
- `src/lib/site.ts`: church info, navigation, built-in hero slides
- `src/lib/i18n.tsx`: 한국어 / EN toggle (`t(ko, en)` in client components, `<T ko en />` elsewhere)
- `src/lib/metadata.ts`: per-page title, description and social preview tags
- `src/app/globals.css`: the color theme and the custom `eyebrow`, `hero-overlay`,
  `animate-fadeup` and `animate-kenburns` utilities

## Keeping the look identical

- `lucide-react` is pinned to 1.25.0: later versions redraw some of the icons this site uses
  (book-open, heart, map-pin, phone, sprout, trash-2).
- Fonts are self-hosted from `@fontsource-variable/noto-sans-kr` and `noto-serif-kr`, the same
  variable font files Google Fonts serves to the original.
- The social preview image (`og:image` in `src/lib/metadata.ts`) is still hosted by Lovable.
