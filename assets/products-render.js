/* ============================================================
   products-render.js
   Dynamically renders the product store grid from T2G_PRODUCTS
   so Dev Mode changes show immediately on reload.
   ============================================================ */
'use strict';

function renderProductGrid() {
  const grid = document.getElementById('dynamic-product-grid');
  if (!grid) return;

  const products = Object.values(T2G_PRODUCTS);
  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--text-light);font-size:.9rem;padding:20px 0;">No products found. Open Dev Mode (Alt+1) to add products.</p>';
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const delay = (i % 3) * 60;
    const hasVariants = p.variants && p.variants.options && p.variants.options.length > 0;
    const btnLabel = hasVariants ? 'Select Options' : 'Add to Cart';
    return `
    <div class="store-card reveal" data-product-id="${p.id}" data-delay="${delay}">
      <div class="store-card-ph">${p.name}<br><small style="font-size:.65rem;opacity:.6;">Image placeholder</small></div>
      <h3>${p.name}</h3>
      <p class="price">${p.priceDisplay}</p>
      <button class="btn btn-green store-action-btn">${btnLabel}</button>
    </div>`;
  }).join('');

  // Re-init scroll reveal for new cards
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = Number(e.target.dataset.delay) || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  // Wire up product card buttons
  if (typeof initProductCards === 'function') initProductCards();
}

document.addEventListener('DOMContentLoaded', () => {
  // Give cart.js + devmode.js time to load saved products first
  setTimeout(renderProductGrid, 0);
});
