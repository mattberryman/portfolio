# mattberryman.com

Personal portfolio site for Matt Berryman — payments, regulation, and AI.

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
index.html              ← Main page
404.html                ← Error page (self-contained styles)
src/
  styles/main.css       ← All CSS
  main.js               ← Slide deck, scroll animations, mobile nav
public/
  fonts/                ← Self-hosted woff2 font files
  icons.svg             ← SVG sprite
  og-*.png              ← Open Graph images
  robots.txt
  sitemap.xml
  _headers              ← Cloudflare security and cache headers
docs/plans/             ← Implementation plans (archived when complete)
```

## Deployment

Cloudflare Pages auto-deploys from `main`. Preview deployments are created for all branches.

Build command: `npm run build`
Output directory: `dist/`
