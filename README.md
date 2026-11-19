# El Centro Korean Church — website

Rebuild of https://elcentro.lovable.app in Next.js 15 + Tailwind v4 + shadcn/ui (Neutral) + react-icons.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build / deploy

`npm run build` writes a static site to `out/` (it's `output: "export"`), so it can go on
Vercel, Netlify, Cloudflare Pages or any static host. On Vercel, just import the repo.

## Supabase

`.env.local` points at the same Supabase project the Lovable site uses, so the home-page
hero slides and `/admin` (login, upload/reorder/caption slides) keep working:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Add the same two variables in your host's environment settings. If they're missing the
site still works and shows the three built-in slides.

When you deploy to a new domain, add it under Supabase → Authentication → URL Configuration
so admin sign-up emails redirect correctly.

## Structure

- `src/lib/site.ts`: church info, nav, default hero slides
- `src/lib/i18n.tsx`: 한국어 / EN toggle (`t(ko, en)`)
- `src/lib/theme.tsx`: light / dark mode
- `src/components/`: header, footer, hero slider, page shell, shadcn `ui/` primitives
- `src/app/*/page.tsx`: one file per page

## History

- Commit 1 "Phase 1": faithful copy of the Lovable site
- Commit 2 "Phase 2": UI improvements. See `CHANGES.md` for each change and how to revert it.
