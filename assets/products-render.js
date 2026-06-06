/* ============================================================
   products-render.js
   Dynamically renders the product grid from T2G_PRODUCTS.
   Each product's imageName field determines the image file:
   put a matching file in assets/img/ and it shows automatically.
   ============================================================ */
'use strict';

function getProductImage(p, cssClass, altText) {
  const imgName = p.imageName || (p.id + '.png');
  const src = 'assets/img/' + imgName;
  // Try to render as <img>; if it 404s the onerror swaps to placeholder
  return `<img
    src="${src}"
    alt="${altText || p.name}"
    class="${cssClass}"
    style="width:100%;height:100%;object-fit:contain;padding:12px;"
    onerror="this.outerHTML='<div class=\\'${cssClass}\\' style=\\'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;text-align:center;gap:6px;\\'><span style=\\'font-size:.62rem;color:#bbb;font-weight:600;text-transform:uppercase;letter-spacing:.05em;\\'>Add image:</span><code style=\\'font-size:.68rem;background:#f0f0f0;padding:2px 6px;border-radius:3px;color:#888;\\'>${imgName}</code><span style=\\'font-size:.6rem;color:#ccc;\\'>assets/img/</span></div>'"
  >`;
}

function renderProductGrid() {
  const grid = document.getElementById('dynamic-product-grid');
  if (!grid) return;

  const products = Object.values(T2G_PRODUCTS);
  if (!products.length) {
    grid.innerHTML = '<p style="color:var(--text-light);font-size:.9rem;padding:20px 0;grid-column:1/-1;">No products found. Press Alt+1 to open Dev Mode and add products.</p>';
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const delay = (i % 3) * 60;
    const hasVariants = p.variants && p.variants.options && p.variants.options.length > 0;
    const btnLabel = hasVariants ? 'Select Options' : 'Add to Cart';
    const img = getProductImage(p, 'store-card-img-el', p.name);
    const shopeeUrl = p.shopeeUrl || window.T2G_SHOPEE_URL || 'https://shopee.ph/shop/1013182247';
    return `
    <div class="store-card reveal" data-product-id="${p.id}" data-delay="${delay}">
      <div class="store-card-ph" style="overflow:hidden;">${img}</div>
      <h3>${p.name}</h3>
      <p class="price">${p.priceDisplay}</p>
      <div style="display:flex;flex-direction:column;gap:7px;">
        <button class="btn btn-green store-action-btn" style="width:100%;justify-content:center;">${btnLabel}</button>
        <a href="${shopeeUrl}" target="_blank" rel="noopener" class="btn shopee-btn" style="width:100%;justify-content:center;text-align:center;background:#fff;color:#ee4d2d;border:2px solid #ee4d2d;display:flex;align-items:center;gap:8px;transition:background 200ms,color 200ms;" onmouseover="this.style.background='#ee4d2d';this.style.color='#fff'" onmouseout="this.style.background='#fff';this.style.color='#ee4d2d'">
          <span style="display:inline-flex;align-items:center;justify-content:center;background:#fff;border-radius:4px;padding:2px;flex-shrink:0;width:24px;height:24px;">
            <img src="assets/img/shopee_icon.png" alt="" width="18" height="18" style="display:block;" onerror="this.style.display='none'">
          </span>
          Buy on Shopee
        </a>
      </div>
    </div>`;
  }).join('');

  // Scroll reveal
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

  // Wire up cart buttons
  if (typeof initProductCards === 'function') initProductCards();
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderProductGrid, 0);
});
