import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('public/favicon.svg');

// apple-touch-icon: 180x180, solid background (iOS rounds corners)
await sharp(svg)
  .resize(180, 180)
  .flatten({ background: '#5b4a8a' })
  .png()
  .toFile('public/apple-touch-icon.png');

console.log('\u2713 apple-touch-icon.png');

// favicon.ico is committed — regenerate manually with to-ico if the SVG changes.

// ============ OG IMAGES ============

// og-paymentslaw.png — pre-sized, committed, no processing needed.

// Copy 3dsspec (already 56 KB, no optimisation needed)
await sharp('../3dsExplorer/public/og-image.png').toFile('public/og-3dsspec.png');

console.log('\u2713 og-3dsspec.png');

console.log('Done.');
