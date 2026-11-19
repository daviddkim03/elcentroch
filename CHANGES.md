# Phase 2 — UI changes

Phase 1 (commit `Phase 1: faithful rebuild…`) is a 1:1 copy of elcentro.lovable.app:
same layout, copy, KO/EN toggle, colors, fonts, spacing, Supabase hero slides and /admin.
Phase 2 (the next commit) applies the changes below. To undo everything at once:
`git revert HEAD` (or `git checkout <phase-1-commit> -- <file>` for one file).

| # | Change | Where | How to revert just this |
|---|--------|-------|-------------------------|
| 1 | **shadcn/ui Neutral theme** replaces the navy + gold palette (light and dark tokens from ui.shadcn.com/colors), radius 0.25rem → 0.625rem | `src/app/globals.css` | Restore the `:root` block from Phase 1 |
| 2 | **Dark mode** with a sun/moon toggle in the header; follows the OS setting on first visit, remembers the choice, no flash on load | `src/lib/theme.tsx`, `layout.tsx`, `site-header.tsx` | Remove `ThemeProvider`, the init script and `ThemeToggle` |
| 3 | **Header**: pill-style nav with active state, segmented 한국어/EN toggle, "Plan a visit" CTA, header shrinks and blurs on scroll | `src/components/site-header.tsx` | Phase 1 version of the file |
| 4 | **Mobile menu** is now a slide-in shadcn Sheet (with Home link, language toggle, address/phone and CTA) instead of a dropdown | `site-header.tsx`, `components/ui/sheet.tsx` | Phase 1 version of the header |
| 5 | **Hero**: glass badge, larger headline, "Plan your visit" + "About us" buttons, service-time hint, round prev/next buttons, progress-bar slide indicators, autoplay pauses on hover, `100svh` for mobile browsers | `src/components/hero-slider.tsx` | Phase 1 version of the file |
| 6 | **Quick-link cards**: rounded grid, icon chips, hover arrow | `src/app/page.tsx` | Phase 1 `page.tsx` section |
| 7 | **Welcome section**: rounded image with alt text, pastor shown as a small profile card, frosted "9:00" badge | `src/app/page.tsx` | Phase 1 `page.tsx` section |
| 8 | **Visit section**: shadcn Cards with icon chips and "Get directions" / "Call us" links, rounded map (greyscale; inverted in dark mode), `#visit` anchor that the CTAs jump to | `src/app/page.tsx` | Phase 1 `page.tsx` section |
| 9 | **Sub-page header**: breadcrumb, one-line intro under each title, slow Ken Burns zoom | `src/components/page-shell.tsx` + each page | Drop `introKo/introEn` props / Phase 1 file |
| 10 | **Info cards** are shadcn Cards with a react-icons icon each (prayer, music, globe, etc.) | `page-shell.tsx` (`InfoCard`) + each page | Remove the `icon` props |
| 11 | **"Join us this Sunday" band** above the footer on every sub-page | `page-shell.tsx` (`VisitBand`) | Delete `<VisitBand />` |
| 12 | **About**: pastor greeting in a card with a quote rule; values get a section heading | `src/app/about/page.tsx` | Phase 1 file |
| 13 | **Worship**: service time shown as a card with a "Weekly" badge | `src/app/worship/page.tsx` | Phase 1 file |
| 14 | **Footer**: three labelled columns (about / contact / explore), service time added, back-to-top link | `src/components/site-footer.tsx` | Phase 1 file |
| 15 | **Admin**: rounded cards and buttons to match (functionality unchanged) | `src/app/admin/page.tsx` | Phase 1 file |
| 16 | **Accessibility**: skip-to-content link, `aria-current` on nav, image alt text, carousel labels, `prefers-reduced-motion` turns off animations | various | — |

Icons: all from react-icons (the Lucide set, `react-icons/lu`, so they match the originals).

Content, copy, translations, routes, Supabase tables and the admin login are unchanged.
New bilingual strings added in Phase 2: "Plan a visit / 방문하기", "Plan your visit / 방문 계획하기",
"Join us this Sunday / 이번 주일에 함께해요", page intros, footer labels, "Back to top / 맨 위로",
"Weekly / 매주", "Main sanctuary / 본당". Please check the Korean wording.
