import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
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
  sizes.map(size =>
    sharp(svg)
      .resize(size, size)
      .flatten({ background: '#5b4a8a' })
      .png()
      .toBuffer()
  )
);

const icoBuffer = await toIco(pngBuffers);
writeFileSync('public/favicon.ico', icoBuffer);

console.log('\u2713 favicon.ico');
console.log('Done.');
