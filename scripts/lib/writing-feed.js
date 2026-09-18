// Reads the Transaction Intelligence RSS feed into the shape the Writing
// section renders. Shared by the Vite build plugin (live fetch at build time)
// and the snapshot refresh script (committed fallback in src/data/writing.json).

export const FEED_URL = 'https://transactionintelligence.net/rss/';
export const FEED_LIMIT = 6;

function unwrap(value) {
  return value
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .trim();
}

function pick(item, tag) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return match ? unwrap(match[1]) : '';
}

function pickAll(item, tag) {
  return [...item.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g'))].map(
    (m) => unwrap(m[1])
  );
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clip(text, max = 180) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

export function parseFeed(xml, limit = FEED_LIMIT) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  return items
    .map((item) => ({
      title: pick(item, 'title'),
      url: pick(item, 'link'),
      excerpt: clip(stripTags(pick(item, 'description'))),
      category: pickAll(item, 'category')[0] || 'Essay',
      published: new Date(pick(item, 'pubDate')).toISOString().slice(0, 10),
    }))
    .filter((post) => post.title && post.url && !Number.isNaN(Date.parse(post.published)))
    .slice(0, limit);
}

export async function fetchFeed({ timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml',
        'user-agent': 'mattberryman.com build (+https://mattberryman.com)',
      },
    });
    if (!response.ok) throw new Error(`feed responded ${response.status}`);
    const posts = parseFeed(await response.text());
    if (!posts.length) throw new Error('feed parsed to zero posts');
    return posts;
  } finally {
    clearTimeout(timer);
  }
}

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCards(posts) {
  return posts
    .map(
      (post) => `
          <a href="${escapeHtml(post.url)}" class="article-card" rel="noopener">
            <span class="card-meta"><span class="tag">${escapeHtml(post.category)}</span><time datetime="${post.published}">${formatDate(post.published)}</time></span>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.excerpt)}</p>
            <span class="read-link">Read on Transaction Intelligence <svg viewBox="0 0 24 24" aria-hidden="true"><use href="/icons.svg#icon-arrow-right" /></svg></span>
          </a>`
    )
    .join('\n');
}
