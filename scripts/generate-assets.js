import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'fs';
import toIco from 'to-ico';

const svg = readFileSync('public/favicon.svg');

// apple-touch-icon: 180x180, solid background (iOS rounds corners)
await sharp(svg)
  .resize(180, 180)
  .flatten({ background: '#5b4a8a' })
  .png()
  .toFile('public/apple-touch-icon.png');

console.log('\u2713 apple-touch-icon.png');

// favicon.ico: 16x16 and 32x32 combined
const sizes = [16, 32];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(svg).resize(size, size).flatten({ background: '#5b4a8a' }).png().toBuffer()
  )
);

const icoBuffer = await toIco(pngBuffers);
writeFileSync('public/favicon.ico', icoBuffer);

console.log('\u2713 favicon.ico');

// ============ OG IMAGES ============

// Optimise paymentslaw (source ~708 KB, target < 200 KB — JPEG for size)
await sharp('../paymentsLegislation/public/og-image.png')
  .resize(1200, 630, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 80 })
  .toFile('public/og-paymentslaw.jpg');

const plSize = (statSync('public/og-paymentslaw.jpg').size / 1024).toFixed(0);
console.log(`\u2713 og-paymentslaw.jpg (${plSize} KB)`);

// Copy 3dsspec (already 56 KB, no optimisation needed)
await sharp('../3dsExplorer/public/og-image.png').toFile('public/og-3dsspec.png');

console.log('\u2713 og-3dsspec.png');

console.log('Done.');
