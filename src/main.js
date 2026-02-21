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
    if (index < 0 || index >= slides.length || index >= dots.length) return;
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

  dots.forEach(dot => {
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
    seed = (seed + 0x6D2B79F5) | 0;
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ============ MOBILE NAV — ACTIVE SECTION ============
function initMobileNav() {
  const navItems = document.querySelectorAll('.mobile-nav-item');
  if (!navItems.length) return;

  const sections = ['writing', 'projects', 'github', 'connect'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(
          `.mobile-nav-item[data-section="${entry.target.id}"]`
        );
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ============ ENTRY POINT ============
document.addEventListener('DOMContentLoaded', () => {
  initSlideDeck();
  initContribGraph();
  initAnimations();
  initMobileNav();
});
