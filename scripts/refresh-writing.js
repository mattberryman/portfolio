// Refreshes the committed Writing snapshot from the live feed.
// The build fetches live and falls back to this file, so the snapshot only
// needs refreshing when the fallback should move forward.
import { writeFile } from 'node:fs/promises';
import { fetchFeed } from './lib/writing-feed.js';

const posts = await fetchFeed();
await writeFile(
  new URL('../src/data/writing.json', import.meta.url),
  `${JSON.stringify(posts, null, 2)}\n`
);
console.log(`wrote ${posts.length} posts to src/data/writing.json`);
