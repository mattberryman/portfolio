import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import { fetchFeed, renderCards } from './scripts/lib/writing-feed.js';

const WRITING_MARKER = '<!-- writing:cards -->';

/**
 * Fills the Writing section from the Transaction Intelligence feed at build
 * time, so the list is current on every deploy without any client-side
 * JavaScript. A feed failure falls back to the committed snapshot rather than
 * failing the build or shipping an empty section.
 */
function writingFeed() {
  return {
    name: 'writing-feed',
    async transformIndexHtml(html) {
      if (!html.includes(WRITING_MARKER)) return html;
      let posts;
      try {
        posts = await fetchFeed();
      } catch (error) {
        console.warn(`[writing-feed] live feed unavailable (${error.message}); using snapshot`);
        posts = JSON.parse(await readFile(new URL('./src/data/writing.json', import.meta.url)));
      }
      return html.replace(WRITING_MARKER, renderCards(posts));
    },
  };
}

export default defineConfig({
  plugins: [writingFeed()],
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
