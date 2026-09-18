// Renders the site's Open Graph cards and favicons from HTML templates.
//
// This is a maintenance tool, not part of `npm run build`: the outputs are
// committed PNGs. It needs a Playwright-driven Chromium, which this repository
// deliberately does not depend on. Run it with an external Playwright install:
//
//   NODE_PATH=/path/to/node_modules node scripts/og/render.mjs
//
// Cards follow the family grammar shared with paymentslaw.eu: a dark ground in
// the site's own deep tone, a spine in the site's accent down the left edge,
// a small-caps eyebrow, an Equity title, the site's mark and wordmark bottom
// left, a family line, and the mark as a faint watermark bleeding off the
// bottom-right corner. No counts and no version numbers, so nothing on a card
// can go stale.
import { createRequire } from 'node:module';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pub = path.join(root, 'public');
const fontsUrl = pathToFileURL(path.join(pub, 'fonts')).href;

const fontFaces = `
  @font-face { font-family: 'Equity'; src: url('${fontsUrl}/equity_a_regular.woff2'); font-weight: 400; }
  @font-face { font-family: 'Equity'; src: url('${fontsUrl}/equity_a_italic.woff2'); font-weight: 400; font-style: italic; }
  @font-face { font-family: 'Equity'; src: url('${fontsUrl}/equity_a_bold.woff2'); font-weight: 700; }
  @font-face { font-family: 'Concourse'; src: url('${fontsUrl}/concourse_ot_3_book.woff2'); font-weight: 400; }
  @font-face { font-family: 'Concourse'; src: url('${fontsUrl}/concourse_6_regular.woff2'); font-weight: 600; }
  @font-face { font-family: 'Concourse'; src: url('${fontsUrl}/concourse_ot_7_bold.woff2'); font-weight: 700; }
  @font-face { font-family: 'Concourse Caps'; src: url('${fontsUrl}/concourse_3_caps_regular.woff2'); font-weight: 400; }
`;

const tiGlyph = (await readFile(path.join(pub, 'marks/transaction-intelligence.svg'), 'utf8'))
  .replace(/<svg[^>]*>/, '')
  .replace('</svg>', '');

function tile(inner, bg) {
  return `<div class="tile" style="background:${bg}">${inner}</div>`;
}

const cards = [
  {
    file: 'og-mattberryman.png',
    ground: '#1f1a2e',
    spine: '#a188e8',
    eyebrow: 'Payments · Authentication · Regulation',
    title: 'Matt Berryman',
    titleFont: 'Concourse',
    secondary:
      'Sales engineering and customer success leadership for payment authentication, and reference tools that give payments people and their AI the primary source.',
    rails: ['paymentslaw.eu · 3dsspec.com', 'transactionintelligence.net'],
    mark: tile('<span class="mono">MB</span>', '#4b2e83'),
    wordmark: 'mattberryman.com',
    family: 'Matt Berryman · Hampshire, UK',
    portrait: pathToFileURL(path.join(pub, 'portrait-640.jpg')).href,
    watermark: '',
  },
  {
    file: 'og-3dsspec.png',
    ground: '#151d24',
    spine: '#334fc4',
    eyebrow: 'EMV 3-D Secure',
    title: '3DS Reference',
    titleFont: 'Concourse',
    secondary:
      'A source-attributed reference for EMV 3-D Secure, with an explorer, a reference library and an MCP for AI clients.',
    rails: [
      'AReq · ARes · CReq · CRes · RReq · RRes',
      'Fields · Messages · Checklists · Comparison',
    ],
    mark: tile('<span class="three">3</span>', '#334fc4'),
    wordmark: '3dsspec.com',
    family: 'A Matt Berryman project',
    watermark: '<span class="three-wm">3</span>',
  },
  {
    file: 'og-transaction-intelligence.png',
    ground: '#0e0d14',
    spine: '#a188e8',
    eyebrow: 'Independent essays',
    title: 'Transaction Intelligence',
    titleFont: 'Equity',
    secondary: 'Independent essays on payments, behaviour and the quiet plumbing of finance.',
    rails: ['Payments · Behaviour · Banking', 'Regulatory · AI · UX'],
    mark: tile(`<svg viewBox="0 0 5040 5040" class="glyph">${tiGlyph}</svg>`, '#4b2e83'),
    wordmark: 'transactionintelligence.net',
    family: 'A Matt Berryman project',
    watermark: `<svg viewBox="0 0 5040 5040" class="glyph-wm">${tiGlyph}</svg>`,
  },
];

function cardHtml(c) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  ${fontFaces}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: ${c.ground}; color: #fafaf9; position: relative; overflow: hidden; font-family: 'Concourse'; }
  .spine { position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: ${c.spine}; }
  .inner { position: absolute; left: 72px; top: 58px; right: 72px; bottom: 52px; }
  .eyebrow { font-family: 'Concourse Caps'; font-size: 24px; letter-spacing: 0.12em; color: ${c.spine}; margin-bottom: 14px; }
  .title { font-family: '${c.titleFont}'; font-weight: 700; font-size: ${c.titleFont === 'Equity' ? 82 : 92}px; line-height: 1.02; letter-spacing: ${c.titleFont === 'Equity' ? '0' : '-0.02em'}; color: #f4f1ea; margin-bottom: 22px; max-width: ${c.portrait ? 720 : 1000}px; white-space: nowrap; }
  .secondary { font-family: 'Equity'; font-size: 32px; line-height: 1.3; color: #d6e0ea; max-width: ${c.portrait ? 720 : 820}px; }
  .rails { position: absolute; left: 0; bottom: 120px; font-weight: 700; font-size: 25px; line-height: 1.55; color: #a8b8ca; }
  .lockup { position: absolute; left: 0; bottom: 0; display: flex; align-items: center; gap: 22px; }
  .tile { width: 76px; height: 76px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #f4f1ea; }
  .tile .mono { font-weight: 700; font-size: 34px; letter-spacing: -0.02em; }
  .tile .three { font-weight: 700; font-size: 56px; line-height: 1; }
  .tile .glyph { width: 60px; height: 60px; fill: #f4f1ea; }
  .wordmark { font-weight: 700; font-size: 30px; color: #e8edf3; }
  .family { position: absolute; right: 0; bottom: 8px; font-family: 'Concourse Caps'; font-size: 19px; letter-spacing: 0.14em; color: #8fa3bb; }
  .portrait { position: absolute; right: 0; top: 0; width: 300px; height: 300px; border-radius: 14px; object-fit: cover; border: 3px solid rgba(255,255,255,0.12); }
  .wm { position: absolute; right: -60px; bottom: -90px; opacity: 0.07; color: ${c.spine}; pointer-events: none; }
  .three-wm { font-weight: 700; font-size: 520px; line-height: 1; display: block; }
  .glyph-wm { width: 400px; height: 400px; fill: ${c.spine}; display: block; }
  </style></head><body>
  <div class="spine"></div>
  <div class="wm">${c.watermark}</div>
  <div class="inner">
    <div class="eyebrow">${c.eyebrow}</div>
    <div class="title">${c.title}</div>
    <div class="secondary">${c.secondary}</div>
    <div class="rails">${c.rails.map((r) => `<div>${r}</div>`).join('')}</div>
    <div class="lockup">${c.mark}<span class="wordmark">${c.wordmark}</span></div>
    <div class="family">${c.family}</div>
    ${c.portrait ? `<img class="portrait" src="${c.portrait}" alt="">` : ''}
  </div>
  </body></html>`;
}

function iconHtml(size) {
  const font = Math.round(size * 0.44);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces}
  * { margin:0; padding:0; }
  body { width:${size}px; height:${size}px; background:#4b2e83; display:flex; align-items:center; justify-content:center; border-radius:${Math.round(size * 0.1875)}px; overflow:hidden; }
  span { font-family:'Concourse'; font-weight:700; font-size:${font}px; color:#f4f1ea; letter-spacing:-0.03em; line-height:1; margin-top:${Math.round(size * 0.02)}px; }
  </style></head><body><span>MB</span></body></html>`;
}

const dir = await mkdtemp(path.join(tmpdir(), 'og-'));
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
for (const c of cards) {
  const file = path.join(dir, c.file.replace('.png', '.html'));
  await writeFile(file, cardHtml(c));
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(pub, c.file), type: 'png' });
  console.log('wrote', c.file);
}
for (const [size, name] of [
  [512, 'icon-512.png'],
  [180, 'apple-touch-icon.png'],
  [32, 'favicon.png'],
]) {
  const file = path.join(dir, `${name}.html`);
  await writeFile(file, iconHtml(size));
  await page.setViewportSize({ width: size, height: size });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(pub, name), type: 'png', omitBackground: true });
  console.log('wrote', name);
}
await browser.close();
