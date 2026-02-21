# Portfolio Production-Ready Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform a single-file prototype into a production-grade static site deployable to Cloudflare Pages at mattberryman.com.

**Architecture:** Vite build pipeline extracts CSS and JS from the monolithic `index.html` into `src/styles/main.css` and `src/main.js`, fingerprints all assets for cache-busting, and outputs to `dist/`. Public assets (favicons, OG images, robots.txt, sitemap.xml, `_headers`) live in `public/` and are copied verbatim by Vite.

**Tech Stack:** Vite, vanilla JS/CSS, sharp (dev dependency, favicon + image generation), Cloudflare Pages.

**Design doc:** `docs/plans/2026-02-21-portfolio-production-ready-design.md`

---

### Task 1: Git init + Vite scaffold

**Files:**

- Create: `package.json`
- Create: `vite.config.js`
- Create: `.gitignore`

**Step 1: Initialise git**

```bash
cd /Users/matt/Projects/portfolio
git init
```

Expected: `Initialized empty Git repository in .../portfolio/.git/`

**Step 2: Create `.gitignore`**

```
node_modules/
dist/
.DS_Store
*.local
```

**Step 3: Create `package.json`**

```json
{
  "name": "portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "generate-assets": "node scripts/generate-assets.js"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "sharp": "^0.33.0",
    "to-ico": "^1.1.5"
  }
}
```

**Step 4: Create `vite.config.js`**

```js
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

**Step 5: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

**Step 6: Verify build runs against current index.html**

```bash
npm run build
```

Expected: `dist/` created, `index.html` output. Warnings about large files are fine at this stage.

**Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore
git commit -m "chore: initialise vite build pipeline"
```

---

### Task 2: Extract CSS to `src/styles/main.css`

**Files:**

- Create: `src/styles/main.css`
- Modify: `index.html` (remove `<style>` block, add `<link>`)

**Step 1: Create `src/styles/main.css`**

Create the file. Copy the entire contents of the `<style>` block from `index.html` (lines 11–896, everything between `<style>` and `</style>`) into this file verbatim.

Then restructure using `@layer` by wrapping each existing comment section:

```css
/* ========================================
   DESIGN SYSTEM — custom properties used as design tokens.
   To add a new article card: copy an existing .article-card div in index.html.
   To add a new project: copy an existing .project-card div in index.html.
   No new CSS required for either.
   ======================================== */

@layer base {
  /* Paste: :root, reset & base, img, a rules here */
}

@layer typography {
  /* Paste: .serif, h1/h2/h3, .label rules here */
}

@layer layout {
  /* Paste: .container, section rules here */
}

@layer components {
  /* Paste: nav, .hero, .slide-deck, .slide-*, .writing-section,
     .article-card, .projects-section, .project-card, .project-*,
     .github-section, .github-card, .github-*, .contrib-*,
     .connect-section, .social-link*, footer rules here */
}

@layer utilities {
  /* Paste: @keyframes fadeUp, .animate-in rules here */
}

@layer responsive {
  /* Paste: all @media blocks here */
}
```

**Step 2: Update `index.html`**

Remove the `<style>…</style>` block entirely. Replace with:

```html
<link rel="stylesheet" href="/src/styles/main.css" />
```

Place it immediately after the Google Fonts `<link>` tags, before `</head>`.

**Step 3: Verify dev server**

```bash
npm run dev
```

Open the URL printed (usually `http://localhost:5173`). Visually confirm: fonts load, layout is correct, colours match original. Check browser console for CSS errors — there should be none.

**Step 4: Verify build**

```bash
npm run build
```

Expected: `dist/assets/main-[hash].css` created. No errors.

**Step 5: Commit**

```bash
git add src/styles/main.css index.html
git commit -m "refactor: extract CSS to src/styles/main.css with @layer structure"
```

---

### Task 3: Extract JS to `src/main.js` + fix contribution graph

**Files:**

- Create: `src/main.js`
- Modify: `index.html` (remove `<script>` block, add module script)

**Step 1: Create `src/main.js`**

```js
// ============ SLIDE DECK ============
function initSlideDeck() {
  const deck = document.getElementById('slideDeck');
  const controls = document.getElementById('slideControls');
  if (!deck || !controls) return;

  const slides = deck.querySelectorAll('.slide');
  const dots = controls.querySelectorAll('.slide-dot');
  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function startAutoplay() {
    interval = setInterval(next, 5000);
  }

  function stopAutoplay() {
    clearInterval(interval);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goTo(parseInt(dot.dataset.target, 10));
      startAutoplay();
    });
  });

  deck.setAttribute('tabindex', '0');
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      stopAutoplay();
      goTo((current + 1) % slides.length);
      startAutoplay();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      stopAutoplay();
      goTo((current - 1 + slides.length) % slides.length);
      startAutoplay();
    }
  });

  deck.addEventListener('mouseenter', stopAutoplay);
  deck.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// ============ CONTRIBUTION GRAPH ============
// Seeded PRNG (mulberry32) — produces an identical graph on every page load.
// Replace seed value to get a different-but-stable pattern.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initContribGraph() {
  const container = document.getElementById('contribGraph');
  if (!container) return;

  const rand = mulberry32(0xdeadbeef);
  const weeks = 26;
  const days = 7;

  for (let d = 0; d < days; d++) {
    const row = document.createElement('div');
    row.className = 'contrib-row';
    for (let w = 0; w < weeks; w++) {
      const cell = document.createElement('div');
      cell.className = 'contrib-cell';
      const r = rand();
      if (r > 0.35) cell.classList.add('l1');
      if (r > 0.55) cell.classList.add('l2');
      if (r > 0.72) cell.classList.add('l3');
      if (r > 0.88) cell.classList.add('l4');
      row.appendChild(cell);
    }
    container.appendChild(row);
  }
}

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-in').forEach((el) => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ============ ENTRY POINT ============
document.addEventListener('DOMContentLoaded', () => {
  initSlideDeck();
  initContribGraph();
  initAnimations();
});
```

**Step 2: Update `index.html`**

Remove the `<script>…</script>` block at the bottom of `<body>`. Replace with:

```html
<script type="module" src="/src/main.js"></script>
```

Place it immediately before `</body>`.

**Step 3: Verify dev server**

```bash
npm run dev
```

Check:

- Slide deck auto-advances every 5 seconds
- Dot navigation works
- Keyboard arrow keys work
- Contribution graph renders identically on every page refresh (hard-refresh with Cmd+Shift+R to bypass browser cache)
- Article cards fade in on scroll

**Step 4: Verify build**

```bash
npm run build
```

Expected: `dist/assets/main-[hash].js` created. No errors.

**Step 5: Commit**

```bash
git add src/main.js index.html
git commit -m "refactor: extract JS to src/main.js, fix contrib graph with seeded PRNG"
```

---

### Task 4: Update HTML `<head>` — meta tags, OG, schema.org

**Files:**

- Modify: `index.html`

**Step 1: Replace the `<head>` meta section**

Find the existing `<head>` block. It currently has `<title>`, one `<meta name="description">`, and the Google Fonts links. Replace/extend it so the complete `<head>` reads:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Matt Berryman — Payments, AI & Regulation</title>
  <meta
    name="description"
    content="13 years deploying AI/ML into Tier 1 Banks and Global Merchants across US, EMEA and APAC. Payments, AI governance and EU regulation."
  />
  <link rel="canonical" href="https://mattberryman.com" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://mattberryman.com" />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:site_name" content="Matt Berryman" />
  <meta property="og:title" content="Matt Berryman — Payments, AI & Regulation" />
  <meta
    property="og:description"
    content="13 years deploying AI/ML into Tier 1 Banks and Global Merchants. Solution Architecture, Customer Success, Payments and EU regulation."
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

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap"
    rel="stylesheet"
  />

  <link rel="stylesheet" href="/src/styles/main.css" />
</head>
```

**Step 2: Verify build**

```bash
npm run build
```

Inspect `dist/index.html` and confirm all meta tags are present in the output.

**Step 3: Validate schema.org markup**

Paste the contents of `dist/index.html` into https://validator.schema.org — confirm the Person entity shows name, jobTitle, and all four `sameAs` URLs with no errors.

**Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add OG meta tags, canonical URL, and schema.org Person structured data"
```

---

### Task 5: Generate favicon assets

**Files:**

- Create: `public/favicon.svg`
- Create: `scripts/generate-assets.js`
- Create: `public/favicon.ico` (generated)
- Create: `public/apple-touch-icon.png` (generated)

**Step 1: Save `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="30" fill="#5b4a8a"/>
  <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <text x="32" y="42" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" font-weight="700" fill="#fff" letter-spacing="-1">MB</text>
</svg>
```

**Step 2: Create `scripts/generate-assets.js`**

```js
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import toIco from 'to-ico';

const svg = readFileSync('public/favicon.svg');

// apple-touch-icon: 180×180, solid background (iOS rounds corners)
await sharp(svg)
  .resize(180, 180)
  .flatten({ background: '#5b4a8a' })
  .png()
  .toFile('public/apple-touch-icon.png');

console.log('✓ apple-touch-icon.png');

// favicon.ico: 16×16 and 32×32 combined
const sizes = [16, 32];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(svg).resize(size, size).flatten({ background: '#5b4a8a' }).png().toBuffer()
  )
);

const icoBuffer = await toIco(pngBuffers);
writeFileSync('public/favicon.ico', icoBuffer);

console.log('✓ favicon.ico');
console.log('Done.');
```

**Step 3: Run the script**

```bash
npm run generate-assets
```

Expected output:

```
✓ apple-touch-icon.png
✓ favicon.ico
Done.
```

Verify both files exist in `public/`:

```bash
ls -lh public/favicon.ico public/apple-touch-icon.png
```

**Step 4: Verify in browser**

```bash
npm run dev
```

Check the browser tab — the purple MB favicon should appear.

**Step 5: Commit**

```bash
git add public/favicon.svg public/favicon.ico public/apple-touch-icon.png scripts/generate-assets.js
git commit -m "feat: add favicon set (SVG, ICO, apple-touch-icon)"
```

---

### Task 6: Add and optimise OG images

**Files:**

- Modify: `scripts/generate-assets.js` (extend to handle OG images)
- Create: `public/og-paymentslaw.png` (optimised)
- Create: `public/og-3dsspec.png` (copied)
- Create: `public/og-mattberryman.png` (owner to supply — placeholder until ready)

**Step 1: Extend `scripts/generate-assets.js`**

Append to the existing script (after the favicon code):

```js
// OG images
// Optimise paymentslaw (source is 708 KB, target < 200 KB)
await sharp('../paymentsLegislation/public/og-image.png')
  .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: false })
  .toFile('public/og-paymentslaw.png');

const plSize = (fs.statSync('public/og-paymentslaw.png').size / 1024).toFixed(0);
console.log(`✓ og-paymentslaw.png (${plSize} KB)`);

// Copy 3dsspec (already 56 KB, no optimisation needed)
await sharp('../3dsExplorer/public/og-image.png').toFile('public/og-3dsspec.png');

console.log('✓ og-3dsspec.png');
```

Add `import fs from 'fs';` at the top of the file alongside the existing imports.

**Step 2: Run the script**

```bash
npm run generate-assets
```

Confirm `og-paymentslaw.png` is under 200 KB. If not, add `.jpeg({ quality: 80 })` instead of `.png(...)` and rename the output file to `og-paymentslaw.jpg` (updating the project card `<img>` src to match).

**Step 3: Remove the old broken file**

```bash
rm public/og-3dsspec.png   # was 0 bytes — replaced by generated copy above
```

(The generate script already writes the correct file to `public/`.)

**Step 4: Placeholder for portfolio OG image**

`public/og-mattberryman.png` will be supplied by the owner. Leave a note in the repo:

```bash
echo "# placeholder — replace with 1200x630 portfolio OG image" > public/og-mattberryman.png.todo
```

**Step 5: Verify build**

```bash
npm run build
ls -lh dist/og-*.png
```

Expected: both files present in `dist/`, paymentslaw well under 200 KB.

**Step 6: Commit**

```bash
git add public/og-paymentslaw.png public/og-3dsspec.png public/og-mattberryman.png.todo scripts/generate-assets.js
git commit -m "feat: add optimised OG images, fix broken og-3dsspec (was 0 bytes)"
```

---

### Task 7: Add sticky bottom mobile nav

**Files:**

- Modify: `index.html` (add `<nav class="mobile-nav">`)
- Modify: `src/styles/main.css` (add mobile nav CSS)
- Modify: `src/main.js` (extend IntersectionObserver for active section)

**Step 1: Add mobile nav HTML to `index.html`**

Immediately after the closing `</nav>` tag of the desktop nav, add:

```html
<!-- ============ MOBILE NAV (sticky bottom, < 768px only) ============ -->
<nav class="mobile-nav" aria-label="Mobile navigation">
  <a href="#writing" class="mobile-nav-item" data-section="writing">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
    <span>Writing</span>
  </a>
  <a href="#projects" class="mobile-nav-item" data-section="projects">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
    <span>Projects</span>
  </a>
  <a href="#github" class="mobile-nav-item" data-section="github">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
      />
    </svg>
    <span>Open Source</span>
  </a>
  <a href="#connect" class="mobile-nav-item" data-section="connect">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M18 20a6 6 0 0 0-12 0" />
      <circle cx="12" cy="10" r="4" />
    </svg>
    <span>Connect</span>
  </a>
</nav>
```

**Step 2: Add mobile nav CSS to `src/styles/main.css`**

Add inside the `@layer components` block, after the existing nav styles:

```css
/* ---- Mobile nav (sticky bottom) ---- */
.mobile-nav {
  display: none; /* shown only in responsive layer below */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(250, 249, 247, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--border);
  justify-content: space-around;
  padding: 0.5rem 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  color: var(--ink-tertiary);
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color var(--transition);
  text-decoration: none;
}

.mobile-nav-item svg {
  width: 20px;
  height: 20px;
}

.mobile-nav-item.active,
.mobile-nav-item:hover {
  color: var(--accent);
}
```

In the `@layer responsive` block, inside the existing `@media (max-width: 768px)` rule, add:

```css
.mobile-nav {
  display: flex;
}
```

**Step 3: Extend `src/main.js` — active section tracking**

Add a new function and call it from `DOMContentLoaded`:

```js
// ============ MOBILE NAV — ACTIVE SECTION ============
function initMobileNav() {
  const navItems = document.querySelectorAll('.mobile-nav-item');
  if (!navItems.length) return;

  const sections = ['writing', 'projects', 'github', 'connect'];
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navItems.forEach((item) => item.classList.remove('active'));
          const active = document.querySelector(
            `.mobile-nav-item[data-section="${entry.target.id}"]`
          );
          if (active) active.classList.add('active');
        }
      });
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
```

In the `DOMContentLoaded` handler, add `initMobileNav();`.

**Step 4: Verify on mobile**

```bash
npm run dev
```

Open browser DevTools → toggle device toolbar → select iPhone 14 (or similar). Confirm:

- Sticky nav appears at bottom of viewport
- All four icons and labels are visible
- Tapping a link scrolls to the correct section
- Active item highlights as you scroll through sections
- Nav does not appear on desktop widths

**Step 5: Commit**

```bash
git add index.html src/styles/main.css src/main.js
git commit -m "feat: add sticky bottom mobile nav with active section tracking"
```

---

### Task 8: Add `robots.txt` and `sitemap.xml`

**Files:**

- Create: `public/robots.txt`
- Create: `public/sitemap.xml`

**Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://mattberryman.com/sitemap.xml
```

**Step 2: Create `public/sitemap.xml`**

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

**Step 3: Verify files appear in build output**

```bash
npm run build
ls dist/robots.txt dist/sitemap.xml
```

Both should exist.

**Step 4: Commit**

```bash
git add public/robots.txt public/sitemap.xml
git commit -m "feat: add robots.txt and sitemap.xml"
```

---

### Task 9: Add Cloudflare security headers

**Files:**

- Create: `public/_headers`

**Step 1: Create `public/_headers`**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' static.cloudflareinsights.com; style-src 'self' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data:; connect-src 'self' cloudflareinsights.com; frame-ancestors 'none'
```

**Note on Cloudflare Analytics:** Analytics is configured to inject automatically via the Cloudflare Pages dashboard — no script tag is added to the HTML. The CSP above whitelists `static.cloudflareinsights.com` (script source) and `cloudflareinsights.com` (beacon POST target) to accommodate that injected tag.

**Step 2: Verify file appears in build output**

```bash
npm run build
cat dist/_headers
```

**Step 3: Commit**

```bash
git add public/_headers
git commit -m "feat: add Cloudflare security headers (CSP, HSTS, X-Frame-Options)"
```

---

### Task 10: Create `404.html`

**Files:**

- Create: `404.html`
- Modify: `vite.config.js` (already configured for multi-page — no change needed)

**Step 1: Create `404.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page not found — Matt Berryman</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --ink: #1a1a2e;
        --ink-secondary: #4a4a5e;
        --ink-tertiary: #7a7a8e;
        --surface: #faf9f7;
        --accent: #5b4a8a;
        --border: rgba(26, 26, 46, 0.08);
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      html {
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
      }
      body {
        font-family:
          'Inter',
          -apple-system,
          sans-serif;
        color: var(--ink);
        background: var(--surface);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
      }
      .container {
        max-width: 36rem;
      }
      .label {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 1rem;
      }
      h1 {
        font-family: 'Newsreader', Georgia, serif;
        font-size: 2.75rem;
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 1rem;
      }
      p {
        color: var(--ink-secondary);
        line-height: 1.7;
        margin-bottom: 2rem;
      }
      a {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: 1px solid rgba(26, 26, 46, 0.14);
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ink-secondary);
        text-decoration: none;
        transition: 180ms ease;
      }
      a:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p class="label">404</p>
      <h1>This page doesn't exist.</h1>
      <p>Or it did and it's gone.</p>
      <a href="/">← Back to mattberryman.com</a>
    </div>
  </body>
</html>
```

**Step 2: Verify build includes 404.html**

```bash
npm run build
ls dist/404.html
```

**Step 3: Preview locally**

```bash
npm run preview
```

Navigate to `http://localhost:4173/nonexistent-page` — confirm the 404 page renders correctly with matching fonts and colours.

**Step 4: Commit**

```bash
git add 404.html
git commit -m "feat: add styled 404 page"
```

---

### Task 11: Final verification

**Step 1: Clean build**

```bash
rm -rf dist && npm run build
```

No errors expected.

**Step 2: Check dist output structure**

```bash
ls -lh dist/
ls -lh dist/assets/
```

Expected:

- `dist/index.html`
- `dist/404.html`
- `dist/_headers`
- `dist/robots.txt`
- `dist/sitemap.xml`
- `dist/favicon.svg`, `dist/favicon.ico`, `dist/apple-touch-icon.png`
- `dist/og-paymentslaw.png`, `dist/og-3dsspec.png`
- `dist/assets/main-[hash].css`
- `dist/assets/main-[hash].js`

**Step 3: Validate HTML**

Copy the contents of `dist/index.html` and paste into https://validator.w3.org/#validate_by_input — zero errors expected (warnings about `type="application/ld+json"` are acceptable).

**Step 4: Verify schema.org**

Paste `dist/index.html` contents into https://validator.schema.org — Person entity with all fields present.

**Step 5: Lighthouse audit**

```bash
npm run preview
```

Open `http://localhost:4173` in Chrome. DevTools → Lighthouse → run for Desktop. Target: Performance ≥ 90, Accessibility ≥ 95, Best Practices = 100, SEO = 100.

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: production-ready build verified"
```

---

### Task 12: Add portfolio OG image (when supplied)

**Prerequisite:** Owner supplies `og-mattberryman.png` (1200×630).

**Step 1:** Copy file to `public/og-mattberryman.png`.

**Step 2:** Delete the placeholder:

```bash
rm public/og-mattberryman.png.todo
```

**Step 3:** Verify dimensions:

```bash
node -e "import('sharp').then(({default: s}) => s('public/og-mattberryman.png').metadata().then(m => console.log(m.width, m.height)))"
```

Expected: `1200 630`

**Step 4:** Rebuild and confirm the file appears in `dist/`.

**Step 5: Commit**

```bash
git add public/og-mattberryman.png
git rm public/og-mattberryman.png.todo
git commit -m "feat: add portfolio OG image"
```

---

## Pending owner actions before go-live

| Item                                                                                 | Status  |
| ------------------------------------------------------------------------------------ | ------- |
| Supply `og-mattberryman.png` (1200×630)                                              | Pending |
| Configure Cloudflare Pages build settings (command: `npm run build`, output: `dist`) | Pending |
| Connect `mattberryman.com` + `mattberryman.co.uk` domains in CF dashboard            | Pending |
| Enable Cloudflare Web Analytics (automatic injection, dashboard setting)             | Pending |
| Enable HSTS preload via CF dashboard after first successful deploy                   | Pending |
