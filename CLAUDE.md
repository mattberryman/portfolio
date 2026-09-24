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
node scripts/refresh-writing.js   # Refresh the committed Writing snapshot from the blog feed
```

Pre-commit hook (Husky) runs `lint` and `format:check` automatically. Commits fail if either fails. Never use `--no-verify`.

## File Structure

```
index.html              ← Single-page entry point (Writing section filled at build time)
404.html                ← Standalone error page (self-contained CSS)
src/
  styles/main.css       ← All CSS — @layer architecture, family tokens
  main.js               ← Theme toggle, scroll animations, mobile nav, footer year
  data/writing.json     ← Committed snapshot of the blog feed (build fallback)
scripts/
  lib/writing-feed.js   ← RSS parser + card renderer shared by the build and the refresh
  refresh-writing.js    ← Rewrites src/data/writing.json from the live feed
  og/render.mjs         ← Renders OG cards and favicons (needs an external Playwright)
public/
  fonts/                ← Self-hosted woff2 files (Equity + Concourse)
  icons.svg             ← SVG sprite (<symbol> elements, <use href="#id">)
  marks/                ← The three project sites' own marks
  og-*.png              ← OG cards, 1200×630, family grammar (see docs/design/)
  cards/                ← WebP copies of the project OG cards shown on the page
  portrait-*.{webp,jpg} ← Portrait, hero and schema.org image
  favicon.png/ico, apple-touch-icon.png, icon-512.png ← MB monogram
  robots.txt
  sitemap.xml
  _headers              ← Cloudflare security/cache headers (CSP hashes the theme boot script)
docs/design/            ← The unified design language across the four sites
vite.config.js          ← Multi-page input + the writing-feed plugin
```

## Design language

The site is one of four (with paymentslaw.eu, 3dsspec.com and
transactionintelligence.net) sharing one design language, recorded in
`docs/design/unified-design-language.md`. The neutrals and the purple accent
are copied from the blog theme's `tokens.css`; keep them in step when either
side changes. Each project card shows that site's own mark and its OG card.

## CSS Architecture

`src/styles/main.css` uses `@layer` in declaration order:

```
@layer base, typography, layout, components, utilities, responsive;
```

- **base** — custom properties (design tokens, light and dark), resets
- **typography** — headings, `.eyebrow`, `.tag`
- **layout** — container, section spacing, section headers
- **components** — nav, theme toggle, hero, buttons, project cards, article cards, about, contact, footer
- **utilities** — `.animate-in`, `.sr-only`
- **responsive** — breakpoint overrides (960px, 768px, 480px)

Later layers override earlier layers regardless of specificity. Add new rules to the appropriate layer.

## Typography System

**Equity** (Matthew Butterick, self-hosted) — all reading text:

- `--font-text` — Equity regular/italic/bold; body, lede, article titles
- Scale baseline: 20px body (`--text-body: 1.25rem`), 22px lede

**Concourse** (Matthew Butterick, self-hosted) — headings and all UI/wayfinding text:

- `--font-ui` — Concourse at 400 (T3 book), 600 (T6) and 700 (T7 bold); h1/h2/h3, nav, buttons, meta
- `--font-caps` — Concourse Caps T3; eyebrows, tags, nav links, family strip

Font files in `public/fonts/`:

- `equity_a_regular.woff2`, `equity_a_italic.woff2`, `equity_a_bold.woff2`
- `concourse_ot_3_book.woff2` (400), `concourse_6_regular.woff2` (600), `concourse_ot_7_bold.woff2` (700)
- `concourse_3_caps_regular.woff2`

## Key Conventions

- **Equity for reading, Concourse for headings and navigation** — do not mix
- **British English** in all copy (organisation, not organization)
- **SVG sprite** — add icons as `<symbol id="icon-name">` in `public/icons.svg`, reference with `<use href="/icons.svg#icon-name">`
- **No new CSS files** — all styles go in `src/styles/main.css` in the correct layer
- **No framework, no dependencies** — keep it that way unless there is a compelling reason
- **Conventional commits** — feat/fix/docs/test/refactor/chore/security

## Writing section

`vite.config.js` replaces the `<!-- writing:cards -->` marker in `index.html`
with the latest posts from the Transaction Intelligence RSS feed at build time.
If the feed is unreachable the build uses `src/data/writing.json` and logs a
warning; it never fails or ships an empty section. No client-side fetch.

## Theme

Three-state preference (auto / light / dark) stored under `localStorage.theme`,
resolved to `data-theme` on `<html>` by the inline boot script in `index.html`
before first paint. That script is allowed by a sha256 hash in
`public/_headers`: if it changes, recompute the hash from `dist/index.html`.

## OG cards and favicons

`scripts/og/render.mjs` renders `public/og-*.png` and the monogram favicons from
HTML templates. It is not part of the build and needs an external Playwright
(`NODE_PATH=... CHROMIUM_PATH=... node scripts/og/render.mjs`). The paymentslaw
card is that site's own `/og/site.png`, copied rather than rendered.

The project cards show WebP copies in `public/cards/` (660w and 1200w) rather
than the full PNGs, which stay for `og:image`. After changing an OG card, rerun:
`for w in 660 1200; do cwebp -q 82 -m 6 -resize $w 0 public/og-<name>.png -o public/cards/<name>-$w.webp; done`

## Mobile Nav

- `.mobile-nav` is a `<nav>` element — the bare `nav` selector applies `top: 0` to it
- `.mobile-nav` must explicitly set `top: auto` to cancel this and honour `bottom: 0`
- Shown only at ≤768px (`display: none` by default, `display: flex` in media query)

## Deployment

**Never deploy to production without explicit user approval.**

Cloudflare Pages auto-deploys from `origin/main` via Workers Builds. Preview deployments are created for all branches. To trigger a build: push to any branch. To go live: push to `main` (after user approves).

## Local Config

`.claude/` is globally gitignored — settings, skills, and hooks are local-only. Don't attempt to commit them.
