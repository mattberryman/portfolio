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

// og-paymentslaw.png, og-3dsspec.png — pre-sized, committed, no processing needed.

console.log('Done.');
