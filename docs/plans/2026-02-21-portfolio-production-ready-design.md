# Portfolio — Production-Ready Design

**Date:** 2026-02-21
**Scope:** Approach B — full production + discoverability
**Hosting:** Cloudflare Pages (`mattberryman.com`, aliased from `mattberryman.co.uk`)
**Input:** Single-file prototype (`index.html`) produced in Cowork

---

## 1. Project Structure

```
portfolio/
├── index.html                  ← Vite entry point
├── 404.html                    ← Styled error page (Vite second entry point)
├── src/
│   ├── styles/
│   │   └── main.css            ← All CSS, restructured with @layer
│   └── main.js                 ← Slide deck + contrib graph + intersection observer
├── public/
│   ├── favicon.svg             ← Primary favicon (purple circle, MB initials)
│   ├── favicon.ico             ← Legacy fallback, generated from SVG via sharp
│   ├── apple-touch-icon.png    ← 180×180, generated from SVG via sharp
│   ├── og-mattberryman.png     ← Portfolio-level OG image (1200×630, TBD by owner)
│   ├── og-paymentslaw.png      ← Optimised from paymentsLegislation/public/og-image.png
│   ├── og-3dsspec.png          ← Copied from 3dsExplorer/public/og-image.png (was 0 bytes)
│   ├── robots.txt
│   └── sitemap.xml
├── _headers                    ← Cloudflare security headers
├── vite.config.js
├── package.json
└── .gitignore
```

---

## 2. Build Tooling

**Vite** — no framework, no plugins. Handles:

- CSS extraction and minification
- JS bundling and minification
- Content-hash fingerprinting on all asset filenames (cache-busting)
- Multi-page input (`index.html` + `404.html`)

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        404: '404.html',
      },
    },
  },
});
```

**Cloudflare Pages settings:**

- Build command: `npm run build`
- Build output directory: `dist`
- Node version: current LTS

**`package.json` scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 3. HTML `<head>` & Meta Tags

Add to `index.html` `<head>`, replacing the existing bare `<meta name="description">`:

```html
<!-- Primary -->
<meta
  name="description"
  content="13 years deploying AI/ML into Tier 1 Banks
  and Global Merchants across US, EMEA and APAC. Payments, AI governance
  and EU regulation."
/>
<link rel="canonical" href="https://mattberryman.com" />

<!-- Open Graph (LinkedIn reads these) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://mattberryman.com" />
<meta property="og:locale" content="en_GB" />
<meta property="og:site_name" content="Matt Berryman" />
<meta property="og:title" content="Matt Berryman — Payments, AI & Regulation" />
<meta
  property="og:description"
  content="13 years deploying AI/ML into Tier 1 Banks
  and Global Merchants. Solution Architecture, Customer Success, Payments
  and EU regulation."
/>
<meta property="og:image" content="https://mattberryman.com/og-mattberryman.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Favicons -->
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

<!-- Schema.org Person -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Matt Berryman",
    "url": "https://mattberryman.com",
    "jobTitle": "Head of Customer Success & Solution Architecture",
    "description": "13 years deploying AI/ML into Tier 1 Banks and Global Merchants.",
    "sameAs": [
      "https://www.linkedin.com/in/mattberryman/",
      "https://github.com/mattberryman",
      "https://transactionintelligence.net",
      "https://matt.berryman.social"
    ]
  }
</script>
```

**Note:** No Twitter/X card meta — professional networking focus (LinkedIn + Transaction Intelligence blog only). `matt.berryman.social` included in `sameAs` for machine-readable identity linkage only.

---

## 4. CSS — Extraction & Structure

Extract the `<style>` block to `src/styles/main.css`. Restructure using CSS `@layer` to make the cascade explicit and the file navigable:

```css
@layer base {
  /* :root design tokens, reset, html/body, img, a */
}

@layer typography {
  /* .serif, h1/h2/h3, .label */
}

@layer layout {
  /* .container, section */
}

@layer components {
  /* nav, .hero, .slide-deck, .article-card, .project-card,
     .github-card, .connect-section, footer — one component per block */
}

@layer utilities {
  /* .animate-in, @keyframes fadeUp */
}
```

No framework migration. The existing CSS custom property system (`--ink`, `--accent`, `--space-6` etc.) already functions as a design token layer — equivalent to what Tailwind's `theme.config` provides. Adding a new article card or project card means copying the existing HTML pattern; no new CSS required.

---

## 5. JavaScript — Extraction & Fixes

Extract the three IIFE blocks from `<script>` to `src/main.js` as named functions with a single `DOMContentLoaded` entry point.

**Contribution graph — deterministic PRNG:**

Replace `Math.random()` with a seeded mulberry32 generator using a fixed seed. The graph will look identical on every page load rather than regenerating randomly, which currently reads as a rendering bug.

```js
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xdeadbeef);
```

---

## 6. Mobile Navigation — Sticky Bottom Bar

Add a second `<nav class="mobile-nav">` element to the HTML (after the existing desktop nav), containing the same four links with small SVG icons above each label.

```css
/* Show only below 768px */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .mobile-nav {
    display: flex;
  }
}
@media (min-width: 769px) {
  .mobile-nav {
    display: none;
  }
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(250, 249, 247, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom); /* iPhone home indicator */
}
```

Active section highlighting: extend the existing `IntersectionObserver` to track which section is in view and apply an `.active` class to the corresponding mobile nav item.

---

## 7. Assets

### Favicon set

- `public/favicon.svg` — provided SVG (purple `#5b4a8a` circle, white "MB" in Georgia serif)
- `public/favicon.ico` — generated from SVG at 16×16 and 32×32 using `sharp`
- `public/apple-touch-icon.png` — SVG rendered at 180×180 using `sharp`; solid `#5b4a8a` background (iOS crops to rounded square, no padding needed)

Generation script (run once, output committed to `public/`):

```js
// scripts/generate-favicons.js
import sharp from 'sharp';
// render SVG → ico + apple-touch-icon.png
```

### OG images

| File                  | Source                                             | Action                                       |
| --------------------- | -------------------------------------------------- | -------------------------------------------- |
| `og-mattberryman.png` | TBD (owner to supply)                              | 1200×630, portfolio-level share image        |
| `og-paymentslaw.png`  | `paymentsLegislation/public/og-image.png` (708 KB) | Copy + optimise with sharp (target < 200 KB) |
| `og-3dsspec.png`      | `3dsExplorer/public/og-image.png` (56 KB)          | Copy as-is (already reasonable size)         |

---

## 8. Discoverability

**`public/robots.txt`:**

```
User-agent: *
Allow: /
Sitemap: https://mattberryman.com/sitemap.xml
```

**`public/sitemap.xml`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mattberryman.com/</loc>
    <lastmod>2026-02-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Update `<lastmod>` manually when content changes.

---

## 9. Security Headers

**`_headers`** (Cloudflare Pages reads this file from the build output root):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' static.cloudflareinsights.com; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data:; connect-src 'self' cloudflareinsights.com; frame-ancestors 'none'
```

**Cloudflare Analytics** is configured via the CF dashboard (automatic injection). The CSP whitelists `static.cloudflareinsights.com` (script source) and `cloudflareinsights.com` (beacon POST target) to accommodate the injected tag. No script tag required in the HTML.

---

## 10. 404 Page

`404.html` — standalone page using the same Google Fonts link, same CSS custom properties (inlined `<style>` block with just the tokens and minimal layout needed), same favicon references. Body copy:

> _This page doesn't exist — or it did and it's gone._
> [← Back to mattberryman.com](/)

Styled to match the site's visual language (dark ink, accent purple, Newsreader serif for the heading). Vite handles it as a second entry point so it receives the same asset fingerprinting as `index.html`.

---

## Out of Scope

- `matt.berryman.social` — separate property, no changes
- Multi-page expansion (blog archive, presentations index) — future work
- Image optimisation pipeline (Vite plugin) — images are few and static; one-time CLI optimisation is sufficient
- Font self-hosting — Google Fonts CDN retained for simplicity; mitigated by the existing `preconnect` hints
