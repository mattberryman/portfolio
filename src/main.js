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

  dots.forEach((dot) => {
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

// ============ SCROLL ANIMATIONS ============
function initAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-in').forEach((el) => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

// ============ MOBILE NAV — ACTIVE SECTION ============
function initMobileNav() {
  const navItems = document.querySelectorAll('.mobile-nav-item');
  if (!navItems.length) return;

  const sections = ['writing', 'projects', 'connect'];
  const visibleSections = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.add(entry.target.id);
        } else {
          visibleSections.delete(entry.target.id);
        }
      });
      navItems.forEach((item) => item.classList.remove('active'));
      const firstVisible = sections.find((id) => visibleSections.has(id));
      if (firstVisible) {
        const active = document.querySelector(`.mobile-nav-item[data-section="${firstVisible}"]`);
        if (active) active.classList.add('active');
      }
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ============ ENTRY POINT ============
document.addEventListener('DOMContentLoaded', () => {
  initSlideDeck();
  initAnimations();
  initMobileNav();
});
