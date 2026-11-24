# El Centro Korean Church website

Design carried over from the original Lovable site: the navy + gold colors, fonts, layout, copy, 한국어 / EN toggle, hero slider,
404 page and the slide manager. On top of it: Plan a Visit, sermons, and a member portal with
login, approved by the pastor.

Stack: Next.js 15 (App Router, static export), React 19, Tailwind CSS v4,
shadcn/ui components, lucide-react icons (react-icons for the YouTube logo), sonner toasts,
Supabase.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and deploy

```bash
npm run build      # writes the static site to out/
```

Every page is pre-rendered to plain HTML (`out/about/index.html` is served at `/about/`), so `out/`
can go on any static host with clean URLs: GitHub Pages, Vercel, Netlify, Cloudflare Pages
or Firebase Hosting.

### GitHub Pages

The site is live at https://daviddkim03.github.io/elcentroch/. Every push to `main` builds and
publishes it with `.github/workflows/deploy.yml`; follow a run in the repo's Actions tab. This
needs Settings > Pages > Source set to "GitHub Actions".

GitHub serves a project site from `/<repo>/`, so the workflow builds with
`NEXT_PUBLIC_BASE_PATH=/elcentroch`. Next adds that prefix to page links and to its own files,
and page URLs end in a slash (`/elcentroch/about/`; `next.config.ts` says why). Plain
URLs to files in `public/` (images, the favicon) need `withBasePath()` from
`src/lib/base-path.ts`, so use it whenever you add one.

To use your own domain instead, add it under Settings > Pages > Custom domain. The next deploy
builds for the domain root (no prefix) without any code change.

## Supabase (hero slides and admin)

The site uses the same Supabase project as the Lovable version, so slides you manage at
`/admin` show up on the home page. `.env` holds its URL and publishable key; both are public
by design (they ship in the browser bundle, and row-level security protects the data). If
they are missing, the site still works and shows the three built-in slides.

What the code expects in Supabase:

- `hero_slides` table: `id`, `image_url`, `title_ko`, `title_en`, `subtitle_ko`, `subtitle_en`, `sort_order`
- `hero` storage bucket for uploaded images
- `has_role(_user_id, _role)` function, used to check that a signed-in user is an admin

When you deploy to a new domain, add its `/admin` URL (for GitHub Pages,
`https://daviddkim03.github.io/elcentroch/admin/`) under Supabase > Authentication > URL
Configuration > Redirect URLs, so admin sign-up emails link back to the right site.

## Member portal

Off until you switch it on. The public site works the same either way.

1. Take a database backup, then run `supabase/migrations/*.sql` in Supabase > SQL Editor. It only
   adds tables, functions and policies; it fails as a whole if a table name is already taken.
2. Supabase > Authentication > URL Configuration: set Site URL to
   `https://daviddkim03.github.io/elcentroch/` and add
   `https://daviddkim03.github.io/elcentroch/**` to Redirect URLs.
3. Supabase > Authentication > SMTP: add your own mail server. The built-in one sends only a few
   emails an hour. Set the minimum password length to 8.
4. Change `NEXT_PUBLIC_MEMBER_PORTAL` in `.env` to `on` and push.
5. The pastor creates an account at `/login/`, confirms the email, then you run once in the SQL
   Editor: `select private.make_pastor('pastor@email', '김요셉');`

Optional: turn on Google or Kakao under Authentication > Providers; their buttons then appear by
themselves. For emails to the pastor (new request) and member (approved): deploy
`supabase functions deploy notify --no-verify-jwt`, set the secrets `WEBHOOK_SECRET`,
`RESEND_API_KEY`, `MAIL_FROM`, `PASTOR_EMAIL` and `SITE_URL`, and add a Database Webhook on
`members` (insert, update) to it with header `x-webhook-secret`.

| | Pastor | Admin | Group leader | Member | Pending |
|---|---|---|---|---|---|
| Approve people, set roles, access log | yes | | | | |
| Care notes | yes (logged) | | | | |
| Members, attendance, content, check-in, giving | yes | yes | | | |
| Own group's posts and phone numbers | if in it | if in it | yes | posts only | |
| News, prayer, events, serving, directory | yes | yes | yes | yes | |

A group leader is whoever is set as that group's leader; it is not a separate role. The rules live
in the database (row-level security), so they hold no matter what the browser sends. `npm test`
attacks them as each kind of user. `npm run e2e` drives the whole
portal in a browser against a local Postgres, Supabase Auth and PostgREST (Linux x64, no Docker).

## Structure

- `src/app/*/page.tsx`: one file per page, including its title and description
- `src/app/login/`, `src/app/my/`: sign-in and the member area
- `src/app/admin/`: pastor and staff area, including the slide manager
- `supabase/`: database migration, email function, tests; `e2e/`: browser tests
- `src/app/not-found.tsx`, `src/app/error.tsx`: 404 and error pages
- `src/components/`: header, footer, hero slider, page shell, shadcn `ui/` primitives
- `src/lib/site.ts`: church info, map and YouTube links, navigation, built-in hero slides
- `src/lib/i18n.tsx`: 한국어 / EN toggle (`t(ko, en)` in client components, `<T ko en />` elsewhere)
- `src/lib/metadata.ts`: per-page title, description and social preview tags
- `src/lib/base-path.ts`: `withBasePath()` for URLs to files in `public/`
- `.github/workflows/deploy.yml`: builds and publishes to GitHub Pages on every push to `main`
- `src/app/globals.css`: the color theme and the custom `eyebrow`, `hero-overlay`,
  `animate-fadeup` and `animate-kenburns` utilities

## Keeping the look identical

- `lucide-react` is pinned to 1.25.0: later versions redraw some of the icons this site uses
  (book-open, heart, map-pin, phone, sprout, trash-2).
- Fonts are self-hosted from `@fontsource-variable/noto-sans-kr` and `noto-serif-kr`, the same
  variable font files Google Fonts serves to the original.
- The social preview image (`og:image` in `src/lib/metadata.ts`) is still hosted by Lovable.
- The home page shows the newest YouTube upload. Its logo comes from react-icons because lucide
  has no brand logos.
