/* ============================================================
   T2G Cart System. cart.js
   Handles: product data, cart state, product modal, cart drawer
   ============================================================ */
'use strict';

/* ── Product Catalogue ──
   Loaded from products-data.js (works on all browsers/devices).
   Dev Mode (Alt+4, see devmode.js) can override individual products via localStorage,
   but products-data.js is always the baseline. To permanently add or
   change products for everyone, edit products-data.js directly.
── */
const T2G_PRODUCTS = Object.assign({}, window.T2G_PRODUCTS_DEFAULT || {});

/* ── Cart State (sessionStorage) ── */
const CART_KEY = 't2g_cart';

function getCart() {
  let cart;
  try { cart = JSON.parse(sessionStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
  if (!Array.isArray(cart)) return [];
  // Always re-price from the product catalogue so stale or edited
  // sessionStorage prices never reach the order email.
  cart.forEach(item => {
    const prod = T2G_PRODUCTS[item.productId];
    if (!prod) return;
    let price = prod.price;
    if (prod.variants && prod.variants.options && item.key.includes('::')) {
      const val = item.key.split('::').slice(1).join('::');
      const opt = prod.variants.options.find(o => String(o.value) === val);
      if (opt) price = Number(opt.price);
    }
    if (typeof price === 'number' && isFinite(price)) {
      item.price = price;
      item.unitDisplay = `PHP ${price.toFixed(2)}`;
    }
    item.name = prod.name || item.name;
    item.qty  = Math.max(1, Math.floor(Number(item.qty) || 1));
  });
  return cart;
}

function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function cartItemKey(productId, variantValue) {
  return variantValue ? `${productId}::${variantValue}` : productId;
}

function addToCart(productId, variantValue, variantLabel, qty, price) {
  const cart = getCart();
  const key  = cartItemKey(productId, variantValue);
  const prod = T2G_PRODUCTS[productId];
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      productId,
      name: prod.name,
      variantLabel: variantLabel || null,
      qty,
      price,
      unitDisplay: `PHP ${price.toFixed(2)}`,
    });
  }
  saveCart(cart);
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
}

function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/* ── Badge ── */
function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

/* ── Cart Drawer Render ── */
function renderCartDrawer() {
  const body = document.querySelector('.cart-drawer-body');
  if (!body) return;
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = '<p class="cart-empty-msg">No products in the cart.</p>';
    return;
  }

  const total = cartTotal(cart);
  let html = '<div class="cart-items">';
  cart.forEach(item => {
    const prod    = T2G_PRODUCTS[item.productId];
    const imgName = (prod && prod.imageName) ? prod.imageName : (item.productId + '.png');
    const imgSrc  = '/assets/img/' + imgName;
    html += `
    <div class="cart-item" data-key="${item.key}">
      <div class="ci-img">
        <img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;display:block;"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span style="display:none;align-items:center;justify-content:center;width:100%;height:100%;font-size:.6rem;color:#aaa;text-align:center;padding:4px;">${item.name}</span>
      </div>
      <div class="ci-info">
        <p class="ci-name">${item.name}${item.variantLabel ? ` - ${item.variantLabel}` : ''}</p>
        <p class="ci-meta">${item.qty} &times; PHP ${item.price.toFixed(2)}</p>
      </div>
      <button class="ci-remove" data-key="${item.key}" aria-label="Remove">&times;</button>
    </div>`;
  });
  html += '</div>';
  html += `
  <div class="cart-subtotal">
    <span>Subtotal:</span>
    <strong>PHP ${total.toFixed(2)}</strong>
  </div>
  <div class="cart-actions">
    <a href="/cart" class="btn btn-green cart-view-btn">View Cart</a>
    <a href="/checkout" class="btn btn-green cart-checkout-btn">Checkout</a>
  </div>`;

  body.innerHTML = html;

  body.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
  });
}


/* -- Image helper: shows real image or filename placeholder -- */
function productImgHTML(p, cssClass) {
  const imgName = p.imageName || (p.id + '.png');
  const src = '/assets/img/' + imgName;
  return '<div class="' + cssClass + '" style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:10px;text-align:center;background:var(--grey-bg,#f0f0f0);">' +
    '<span style="font-size:.58rem;color:#bbb;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Add image:</span>' +
    '<code id="img_' + p.id + '" style="font-size:.66rem;background:#eee;padding:2px 6px;border-radius:3px;color:#888;">' + imgName + '</code>' +
    '<span style="font-size:.58rem;color:#ccc;">assets/img/</span></div>';
}

function productImgSmart(p, cssClass, style) {
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const imgName = p.imageName || (p.id + '.png');
  const src = '/assets/img/' + encodeURI(imgName);
  return `<img src="${src}" alt="${esc(p.name)}" class="${esc(cssClass)}" style="${esc(style || '')}width:100%;height:100%;object-fit:contain;padding:8px;" onerror="t2gImgFallback(this)">`;
}

/* Missing image: show a quiet logo tile instead of a broken image icon */
function t2gImgFallback(img) {
  const tile = document.createElement('div');
  tile.className = img.className;
  tile.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--grey-bg,#f0f0f0);';
  tile.innerHTML = '<img src="/assets/img/logo.png" alt="" style="width:40%;max-width:90px;opacity:.3;">';
  img.replaceWith(tile);
}

/* ── Product Modal ── */
function buildModal(productId) {
  const prod = T2G_PRODUCTS[productId];
  if (!prod) return;

  // Related products HTML
  const relatedHTML = (prod.related || []).slice(0, 4).map(rid => {
    const r = T2G_PRODUCTS[rid];
    if (!r) return '';
    return `
    <div class="rel-card" data-pid="${r.id}">
      <div class="rel-img" style="overflow:hidden;">${productImgSmart(r,"rel-img-el","")}</div>
      <h4>${r.name}</h4>
      <p>${r.priceDisplay}</p>
      <button class="btn btn-green rel-atc" data-pid="${r.id}" style="font-size:.65rem;padding:7px 14px;">Add to Cart</button>
    </div>`;
  }).join('');

  // Variant selector
  let variantHTML = '';
  if (prod.variants) {
    const opts = prod.variants.options.map(o =>
      `<option value="${o.value}" data-price="${o.price}">${o.label}</option>`
    ).join('');
    variantHTML = `
    <div class="pm-variant-row">
      <span class="pm-variant-label">${prod.variants.label.toUpperCase()}</span>
      <div class="pm-variant-right">
        <select class="pm-variant-select" id="pm-variant">${opts}</select>
      </div>
    </div>
    <div class="pm-divider"></div>`;
  }

  const initPrice = prod.variants ? prod.variants.options[0].price : prod.price;

  const html = `
  <div class="pm-overlay" id="pm-overlay">
    <div class="pm-backdrop" id="pm-backdrop"></div>
    <div class="pm-dialog">
      <button class="pm-close" id="pm-close" aria-label="Close">&times;</button>

      <!-- Added notice (hidden by default) -->
      <div class="pm-added-notice" id="pm-added-notice" style="display:none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
        &ldquo;${prod.name}&rdquo; has been added to your cart.
      </div>

      <!-- Product section -->
      <div class="pm-product">
        <div class="pm-img" style="background:var(--grey-bg,#f0f0f0);overflow:hidden;">${productImgSmart(prod,"pm-img-el","")}</div>
        <div class="pm-info">
          <h2 class="pm-name">${prod.name}</h2>
          <p class="pm-price" id="pm-price">PHP ${initPrice.toFixed(2)}</p>
          <div class="pm-divider"></div>
          ${variantHTML}
          <div class="pm-qty-row">
            <button class="pm-qty-btn" id="pm-qty-minus">-</button>
            <input class="pm-qty-input" id="pm-qty" type="number" value="1" min="1" max="99" readonly>
            <button class="pm-qty-btn" id="pm-qty-plus">+</button>
            <button class="btn btn-green pm-atc-btn" id="pm-atc" style="flex:1;">ADD TO CART</button>
          </div>
          <a href="${prod.shopeeUrl || window.T2G_SHOPEE_URL || 'https://shopee.ph/shop/1013182247'}" target="_blank" rel="noopener"
            style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;padding:11px 16px;background:#ee4d2d;color:#fff;border-radius:3px;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 7.5h-1.7C18.4 4.5 15.5 2 12 2S5.6 4.5 5.2 7.5H3.5C2.1 7.5 1 8.6 1 10v10c0 1.4 1.1 2.5 2.5 2.5h17c1.4 0 2.5-1.1 2.5-2.5V10c0-1.4-1.1-2.5-2.5-2.5zM12 4c2.3 0 4.3 1.5 4.7 3.5H7.3C7.7 5.5 9.7 4 12 4zm0 10c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>
            Buy on Shopee
          </a>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pm-tabs">
        <button class="pm-tab active" data-tab="description">Description</button>
        <button class="pm-tab" data-tab="info">Additional Information</button>
        <button class="pm-tab" data-tab="reviews">Reviews (0)</button>
      </div>
      <div class="pm-tab-content" id="pm-tab-description">${prod.description}</div>
      <div class="pm-tab-content" id="pm-tab-info" style="display:none;">${productInfoTable(prod)}</div>
      <div class="pm-tab-content" id="pm-tab-reviews" style="display:none;"><div id="pm-reviews-mount"></div></div>

      ${prod.related && prod.related.length ? `
      <!-- Related -->
      <div class="pm-related">
        <h3>Related Products</h3>
        <div class="pm-related-grid">${relatedHTML}</div>
      </div>` : ''}
    </div>
  </div>`;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const modal = wrapper.firstElementChild;
  document.body.appendChild(modal);

  // Close handlers
  const close = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('#pm-backdrop').addEventListener('click', close);
  modal.querySelector('#pm-close').addEventListener('click', close);
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }});

  // Qty
  let qty = 1;
  const qtyInput = modal.querySelector('#pm-qty');
  modal.querySelector('#pm-qty-minus').addEventListener('click', () => { if (qty > 1) { qty--; qtyInput.value = qty; } });
  modal.querySelector('#pm-qty-plus').addEventListener('click', () => { qty++; qtyInput.value = qty; });

  // Variant price update
  const priceEl  = modal.querySelector('#pm-price');
  const varSel   = modal.querySelector('#pm-variant');
  const getPrice = () => {
    if (varSel) return Number(varSel.options[varSel.selectedIndex].dataset.price);
    return prod.price;
  };
  varSel?.addEventListener('change', () => { priceEl.textContent = `PHP ${getPrice().toFixed(2)}`; });

  // Add to Cart
  modal.querySelector('#pm-atc').addEventListener('click', () => {
    const price     = getPrice();
    const varOpt    = varSel ? varSel.options[varSel.selectedIndex] : null;
    const varVal    = varOpt ? varOpt.value : null;
    const varLbl    = varOpt ? varOpt.label : null;
    addToCart(prod.id, varVal, varLbl, qty, price);

    // Show added notice
    const notice = modal.querySelector('#pm-added-notice');
    notice.style.display = 'flex';
    setTimeout(() => { notice.style.display = 'none'; }, 3000);
  });

  // Tabs
  modal.querySelectorAll('.pm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.pm-tab-content').forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      modal.querySelector(`#pm-tab-${tab.dataset.tab}`).style.display = 'block';
    });
  });

  // ── Reviews (stored in Supabase, shown after approval) ──
  if (window.T2G_REVIEWS) {
    const tabBtn = modal.querySelector('.pm-tab[data-tab="reviews"]');
    T2G_REVIEWS.mount(modal.querySelector('#pm-reviews-mount'), prod, {
      onCount: n => { if (tabBtn) tabBtn.textContent = `Reviews (${n})`; },
    });
  }

  // Related product quick-add
  modal.querySelectorAll('.rel-atc').forEach(btn => {
    btn.addEventListener('click', () => {
      const rp = T2G_PRODUCTS[btn.dataset.pid];
      if (rp) addToCart(rp.id, null, null, 1, rp.price);
    });
  });
  modal.querySelectorAll('.rel-card').forEach(card => {
    card.querySelector('.rel-img')?.addEventListener('click', () => {
      close();
      setTimeout(() => buildModal(card.dataset.pid), 50);
    });
  });

  document.body.style.overflow = 'hidden';
}

/* ── Wire up product cards on products.html ── */
function initProductCards() {
  document.querySelectorAll('[data-product-id]').forEach(card => {
    const pid  = card.dataset.productId;
    const prod = T2G_PRODUCTS[pid];
    if (!prod) return;

    const actionBtn = card.querySelector('.store-action-btn');
    if (!actionBtn) return;

    if (prod.variants) {
      // Has variants → open modal
      actionBtn.textContent = 'Select Options';
      actionBtn.addEventListener('click', () => buildModal(pid));
    } else {
      // Simple → add straight to cart
      actionBtn.textContent = 'Add to Cart';
      actionBtn.addEventListener('click', () => {
        addToCart(prod.id, null, null, 1, prod.price);
        // Open cart drawer
        document.getElementById('cart-overlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCartDrawer();
});


/* ── "Additional information" table, shared by the quick view and product page ── */
function productInfoTable(prod) {
  const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = [];
  if (prod.variants && prod.variants.options && prod.variants.options.length) {
    rows.push([prod.variants.label || 'Options', prod.variants.options.map(o => `${esc(o.label || o.value)} (PHP ${Number(o.price).toFixed(2)})`).join(', ')]);
  }
  if (prod.weightKg) rows.push(['Shipping weight', `${prod.weightKg < 1 ? Math.round(prod.weightKg * 1000) + ' g' : prod.weightKg + ' kg'} (used to work out the delivery fee)`]);
  rows.push(['Made in', 'San Isidro, Jasaan, Misamis Oriental, Philippines']);
  rows.push(['Pickup', 'Free at T2G Jasaan or T2G Cagayan de Oro (Rizal St)']);
  rows.push(['Delivery', 'Nationwide by courier. PHP 190 for orders under 3 kg, plus PHP 80 for each additional kg.']);
  rows.push(['Payment', 'GCash, BPI bank transfer, or cash when you pick up']);
  if (prod.shopeeUrl) rows.push(['Also on', `<a href="${esc(prod.shopeeUrl)}" target="_blank" rel="noopener" style="color:var(--green);text-decoration:underline;">Shopee</a>`]);
  return '<table class="info-table">' + rows.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('') + '</table>';
}
