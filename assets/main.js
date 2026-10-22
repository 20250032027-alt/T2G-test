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

  /* ── Contact form (Formspree) ── */
  const contactForm = document.getElementById('contact-form');
  const formMsg     = document.getElementById('form-msg');
  contactForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const res = await fetch('https://formspree.io/f/xwvzqkor', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm),
      });
      if (res.ok) {
        contactForm.reset();
        formMsg.textContent = 'Message sent. We will be in touch soon.';
        formMsg.style.color  = '';
        formMsg.style.display = 'block';
        submitBtn.style.display = 'none';
      } else {
        const data = await res.json().catch(() => ({}));
        formMsg.textContent = (data.errors && data.errors[0]?.message) || 'Something went wrong. Please try again or email us directly.';
        formMsg.style.color  = '#cc3333';
        formMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    } catch {
      formMsg.textContent = 'Could not send — please check your connection and try again.';
      formMsg.style.color  = '#cc3333';
      formMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });

});

/* ── Safe image placeholder handler ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img.safe-img').forEach(img => {
    const fname = img.dataset.ph || 'image';
    img.addEventListener('error', () => {
      const wrap = img.parentElement;
      img.style.display = 'none';
      // Create placeholder div
      const ph = document.createElement('div');
      ph.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:12px;text-align:center;background:var(--cream-mid,#e8ddd0);';
      ph.innerHTML =
        '<span style="font-size:.58rem;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Add image:</span>' +
        '<code style="font-size:.68rem;background:#e0d8cc;padding:2px 8px;border-radius:3px;color:#888;">' + fname + '</code>' +
        '<small style="font-size:.55rem;color:#bbb;">assets/img/</small>';
      if (wrap) wrap.appendChild(ph);
    }, { once: true });
  });
});

/* ── Image loading shimmer ──
   Wraps each <img>'s parent with a shimmer background while it loads,
   removing it once the image has actually painted (or instantly if it
   was already cached). Covers images present on page load AND images
   inserted later by JS (product grids, galleries, etc.) via MutationObserver. */
(function () {
  const SKIP_SELECTOR = '.nav-cart svg, svg'; // never applies to icons anyway (svg isn't <img>), kept for clarity

  function shimmerify(img) {
    if (!img || img.dataset.shimmerDone) return;
    if (img.tagName !== 'IMG') return;
    // Skip tiny icons (shimmer looks odd on small inline icons like the Shopee badge)
    const w = img.getAttribute('width');
    if (w && parseInt(w, 10) <= 24) return;

    img.dataset.shimmerDone = '1';
    const wrap = img.parentElement;
    if (!wrap) return;

    wrap.classList.add('img-shimmer-wrap');

    function markLoaded() {
      wrap.classList.add('img-loaded');
    }

    if (img.complete && img.naturalWidth > 0) {
      // Already loaded (cached) — skip the shimmer flash entirely
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true }); // don't shimmer forever if it 404s
    }
  }

  function scan(root) {
    (root.querySelectorAll ? root.querySelectorAll('img') : []).forEach(shimmerify);
  }

  document.addEventListener('DOMContentLoaded', () => scan(document));

  // Catch images rendered after initial load (product cards, galleries, etc.)
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return; // element nodes only
        if (node.tagName === 'IMG') shimmerify(node);
        else if (node.querySelectorAll) scan(node);
      });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

/* ============================================================
   Small site-wide helpers
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Mark the current page in the nav (for styling and screen readers) */
  const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a[href], .mobile-menu a[href], #mobile-menu a[href]').forEach(a => {
    const raw = (a.getAttribute('href') || '').replace(/#.*$/, '').replace(/\?.*$/, '');
    if (!raw || /^(https?:|mailto:|tel:)/.test(raw)) return;
    const target = ('/' + raw.replace(/^\.?\//, '')).replace(/\.html$/, '');
    const norm = target === '/index' ? '/' : target;
    if (norm && norm === here) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });

  /* Keep the footer year current */
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
});

/* Copy-to-clipboard for any element with data-copy (order IDs, GCash number) */
document.addEventListener('click', async e => {
  const btn = e.target.closest('[data-copy], [data-copy-from]');
  if (!btn) return;
  const text = btn.dataset.copy
    || (document.getElementById(btn.dataset.copyFrom) || {}).textContent || '';
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text.trim());
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text.trim();
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch {}
    ta.remove();
  }
  const old = btn.textContent;
  btn.textContent = 'Copied';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1600);
});

/* "Skip to content" link for keyboard users: jumps past the header and menu */
(function addSkipLink() {
  const run = () => {
    if (document.querySelector('.skip-link')) return;
    let target = document.querySelector('main');
    if (!target) {
      const menu = document.getElementById('mobile-menu') || document.querySelector('header');
      target = menu && menu.nextElementSibling;
      while (target && /^(SCRIPT|STYLE|NOSCRIPT)$/.test(target.tagName)) target = target.nextElementSibling;
    }
    if (!target) return;
    if (!target.id) target.id = 'main-content';
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    const link = document.createElement('a');
    link.className = 'skip-link';
    link.href = '#' + target.id;
    link.textContent = 'Skip to content';
    document.body.insertBefore(link, document.body.firstChild);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
