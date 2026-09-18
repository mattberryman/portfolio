# mattberryman.com

Personal profile site for Matt Berryman — payments, authentication and regulation.

Live at **[mattberryman.com](https://mattberryman.com)** (also mattberryman.co.uk).

## Stack

- Vanilla HTML, CSS, JavaScript — no framework
- [Vite 6](https://vite.dev) for build tooling
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com)
- Typography: [Equity](https://mbtype.com/fonts/equity/) and [Concourse](https://mbtype.com/fonts/concourse/) by Matthew Butterick, self-hosted

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## Project Structure

```
index.html              ← Main page (Writing section filled from the blog feed at build time)
404.html                ← Error page (self-contained styles)
src/
  styles/main.css       ← All CSS, light and dark tokens
  main.js               ← Theme toggle, scroll animations, mobile nav
  data/writing.json     ← Committed feed snapshot, the build's fallback
scripts/                ← Feed parser, snapshot refresh, OG card renderer
public/
  fonts/                ← Self-hosted woff2 font files
  icons.svg             ← SVG sprite
  marks/                ← The project sites' marks
  og-*.png              ← Open Graph cards (1200×630)
  robots.txt
  sitemap.xml
  _headers              ← Cloudflare security and cache headers
docs/design/            ← The design language shared with paymentslaw.eu, 3dsspec.com and transactionintelligence.net
```

## Deployment

Cloudflare Pages auto-deploys from `main`. Preview deployments are created for all branches.

Build command: `npm run build`
Output directory: `dist/`
