'use strict';
document.addEventListener('DOMContentLoaded', () => {

  /* ── Mobile nav (slide-in panel from left) ── */
  const toggle      = document.querySelector('.nav-toggle');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const mobileBd    = document.getElementById('mobile-backdrop');

  const openMenu  = () => {
    mobileMenu?.classList.add('open');
    toggle?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    mobileMenu?.classList.remove('open');
    toggle?.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggle?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileBd?.addEventListener('click', closeMenu);
  mobileMenu?.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); closeCart(); } });

  /* ── Cart drawer (slide-in from right) ── */
  const cartOverlay  = document.getElementById('cart-overlay');
  const cartBtn      = document.getElementById('cart-btn');
  const cartClose    = document.getElementById('cart-close-btn');
  const cartBackdrop = document.getElementById('cart-backdrop');

  const openCart  = () => {
    cartOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    cartOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  };

  cartBtn?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartBackdrop?.addEventListener('click', closeCart);

  /* ── Generic slider factory ── */
  function makeSlider(trackSel, dotsSel, prevSel, nextSel) {
    const track = document.querySelector(trackSel);
    if (!track) return;
    const slides = track.children;
    const dotsWrap = document.querySelector(dotsSel);
    let cur = 0;

    const go = (n) => {
      cur = ((n % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dotsWrap?.querySelectorAll('[data-dot]').forEach((d, i) =>
        d.classList.toggle('active', i === cur)
      );
    };

    dotsWrap?.querySelectorAll('[data-dot]').forEach((d, i) =>
      d.addEventListener('click', () => go(i))
    );
    document.querySelector(prevSel)?.addEventListener('click', () => go(cur - 1));
    document.querySelector(nextSel)?.addEventListener('click', () => go(cur + 1));

    if (slides.length > 1) {
      const timer = setInterval(() => go(cur + 1), 5000);
      // Pause on hover
      track.closest('section')?.addEventListener('mouseenter', () => clearInterval(timer));
    }
  }

  makeSlider('.hero-track',      '.hero-dots',      '.hero-arrow-prev',      '.hero-arrow-next');
  makeSlider('.lifestyle-track', '.lifestyle-dots', '.lifestyle-arrow-prev', '.lifestyle-arrow-next');

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── Active nav link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page || (page === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ── Scroll reveal ── */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = Number(e.target.dataset.delay) || 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ── Contact form ── */
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    e.target.style.opacity = '.5';
    e.target.style.pointerEvents = 'none';
    document.getElementById('form-msg').style.display = 'block';
  });

});
