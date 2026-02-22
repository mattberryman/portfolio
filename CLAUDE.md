# CLAUDE.md — Agent Instructions

## Project

Matt Berryman's personal portfolio site. Vanilla HTML/CSS/JS — no framework.
Live at **mattberryman.com** (also mattberryman.co.uk), hosted on **Cloudflare Pages** with Workers Builds CI/CD.

## Commands

```bash
npm run dev          # Vite dev server (hot reload)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
npm run lint         # ESLint
npm run format       # Prettier write
npm run format:check # Prettier check (runs on pre-commit)
```

Pre-commit hook (Husky) runs `lint` and `format:check` automatically. Commits fail if either fails. Never use `--no-verify`.

## File Structure

```
index.html              ← Single-page entry point
404.html                ← Standalone error page (self-contained CSS)
src/
  styles/main.css       ← All CSS — @layer architecture
  main.js               ← Slide deck, scroll animations, mobile nav
public/
  fonts/                ← Self-hosted woff2 files (Equity + Concourse)
  icons.svg             ← SVG sprite (<symbol> elements, <use href="#id">)
  og-*.png              ← OG images (1200×630)
  favicon.png/ico       ← Favicons
  apple-touch-icon.png
  robots.txt
  sitemap.xml
  _headers              ← Cloudflare security/cache headers
  profile@2x.png        ← Portrait (not currently used in HTML)
vite.config.js          ← Multi-page input: index.html + 404.html
wrangler.toml           ← pages_build_output_dir = "./dist"
docs/plans/             ← Implementation plans (delete when complete)
```

## CSS Architecture

`src/styles/main.css` uses `@layer` in declaration order:

```
@layer base, typography, layout, components, utilities, responsive;
```

- **base** — custom properties (design tokens), resets
- **typography** — `.label`, body text rules
- **layout** — hero, hero-grid, section spacing
- **components** — nav, slide deck, article cards, project cards, connect, footer
- **utilities** — `.animate-in`, `.sr-only`
- **responsive** — breakpoint overrides (960px, 768px, 480px)

Later layers override earlier layers regardless of specificity. Add new rules to the appropriate layer.

## Typography System

**Equity** (Matthew Butterick, self-hosted) — all reading text:

- `--font` — Equity regular/italic/bold; body text, descriptions, headings
- Scale baseline: 25px body (`--body: 1.5625rem`)

**Concourse** (Matthew Butterick, self-hosted) — all UI/wayfinding text:

- `--font-nav` — Concourse T6 regular; nav logo, project URLs, CTA buttons
- `--font-nav-caps` — Concourse Caps T3; section labels, card tags, slide numbers, link CTAs, social links

Font files in `public/fonts/`:

- `equity_a_regular.woff2`
- `equity_a_italic.woff2`
- `equity_a_bold.woff2`
- `concourse_6_regular.woff2`
- `concourse_3_caps_regular.woff2`

## Key Conventions

- **Equity for reading, Concourse for navigation/classification** — do not mix
- **British English** in all copy (organisation, not organization)
- **SVG sprite** — add icons as `<symbol id="icon-name">` in `public/icons.svg`, reference with `<use href="/icons.svg#icon-name">`
- **No new CSS files** — all styles go in `src/styles/main.css` in the correct layer
- **No framework, no dependencies** — keep it that way unless there is a compelling reason
- **Conventional commits** — feat/fix/docs/test/refactor/chore/security

## Slide Deck

- 3 slides, `position: absolute; inset: 0` inside `.slide-deck` (which is `position: relative`)
- Deck height comes entirely from `aspect-ratio` — never set `aspect-ratio: auto` as it collapses the container to 0 height
- Autoplay at 5s intervals; pauses on hover; keyboard navigable

## Mobile Nav

- `.mobile-nav` is a `<nav>` element — the bare `nav` selector applies `top: 0` to it
- `.mobile-nav` must explicitly set `top: auto` to cancel this and honour `bottom: 0`
- Shown only at ≤768px (`display: none` by default, `display: flex` in media query)

## Deployment

**Never deploy to production without explicit user approval.**

Cloudflare Pages auto-deploys from `origin/main` via Workers Builds. Preview deployments are created for all branches. To trigger a build: push to any branch. To go live: push to `main` (after user approves).

## Pending TODOs

See `memory/MEMORY.md` for current pending items (schema.org knowsAbout, OG image, CF domain config, analytics).
