// ============ THEME ============
// Three-state preference (auto / light / dark), stored under `theme`, resolved
// to data-theme on <html>. The inline boot script in index.html applies the
// stored preference before first paint; this keeps it in sync afterwards.
function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector('[data-action="toggle-theme"]');
  if (!button) return;

  const order = ['auto', 'light', 'dark'];
  const labels = { auto: 'automatic', light: 'light', dark: 'dark' };
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(pref) {
    root.setAttribute('data-theme-pref', pref);
    root.setAttribute('data-theme', pref === 'auto' ? (media.matches ? 'dark' : 'light') : pref);
    button.setAttribute('aria-label', `Theme: ${labels[pref]}`);
  }

  apply(root.getAttribute('data-theme-pref') || 'auto');

  button.addEventListener('click', () => {
    const current = root.getAttribute('data-theme-pref') || 'auto';
    const next = order[(order.indexOf(current) + 1) % order.length];
    try {
      if (next === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', next);
    } catch {
      /* storage unavailable; the choice lasts for this page only */
    }
    apply(next);
  });

  media.addEventListener('change', () => {
    if ((root.getAttribute('data-theme-pref') || 'auto') === 'auto') apply('auto');
  });
}

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
  const targets = document.querySelectorAll('.animate-in');
  if (!targets.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  targets.forEach((el) => observer.observe(el));
}

// ============ MOBILE NAV — ACTIVE SECTION ============
function initMobileNav() {
  const navItems = document.querySelectorAll('.mobile-nav-item');
  if (!navItems.length) return;

  const sections = [...navItems].map((item) => item.dataset.section);
  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      navItems.forEach((item) => item.classList.remove('active'));
      const first = sections.find((id) => visible.has(id));
      if (first) {
        document
          .querySelector(`.mobile-nav-item[data-section="${first}"]`)
          ?.classList.add('active');
      }
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ============ FOOTER YEAR ============
function initYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

// ============ ENTRY POINT ============
initTheme();
initAnimations();
initMobileNav();
initYear();
