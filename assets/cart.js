/* ============================================================
   T2G Cart System — cart.js
   Handles: product data, cart state, product modal, cart drawer
   ============================================================ */
'use strict';

/* ── Product Catalogue ── */
const T2G_PRODUCTS = {
  popcorn: {
    id: 'popcorn',
    name: 'Popcorn',
    price: 170,
    priceDisplay: 'PHP 170.00',
    priceRange: null,
    variants: {
      label: 'Flavor',
      options: [
        { value: 'cheese-caramel', label: 'Cheese Caramel', price: 170 },
        { value: 'dark-choco-cranberry', label: 'Dark Choco Cranberry', price: 170 },
      ]
    },
    description: `<p>Enjoy movie nights with T2G Popcorn — a guilt-free snack made from all-natural ingredients and sweetened only with our coco sugar and coco syrup. No artificial flavors, no preservatives.</p><ul><li>All-natural ingredients</li><li>Nutritious</li><li>No additives or preservatives</li></ul>`,
    related: ['coco-balsamic', 'coco-sugar', 'coco-vinegar', 'coco-jam'],
  },
  'coco-balsamic': {
    id: 'coco-balsamic',
    name: 'Coco Balsamic Vinegar',
    price: 200,
    priceDisplay: 'PHP 200.00',
    priceRange: null,
    variants: null,
    description: `<p>Aged coconut sap vinegar with a deep, complex flavor. Dark, tangy, slightly sweet — a Philippine-made take on a classic condiment. Great for salad dressings, glazes, and gourmet dishes.</p><ul><li>Naturally fermented</li><li>All-natural</li><li>No additives</li></ul>`,
    related: ['coco-vinegar', 'coco-seasoning', 'coco-syrup', 'coco-jam'],
  },
  'coco-vinegar': {
    id: 'coco-vinegar',
    name: 'Coco Vinegar',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    variants: null,
    description: `<p>Naturally fermented from fresh coconut sap. Milder and smoother than cane vinegar, with beneficial probiotic properties from the fermentation process itself.</p><ul><li>Naturally fermented</li><li>Probiotic</li><li>No additives or preservatives</li></ul>`,
    related: ['coco-balsamic', 'coco-seasoning', 'coco-jam', 'coco-syrup'],
  },
  'coco-seasoning': {
    id: 'coco-seasoning',
    name: 'Coco Seasoning',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    variants: null,
    description: `<p>A coconut-based seasoning sauce made from coconut sap. Low in sodium, gluten-free, and allergen-free. A healthy alternative to traditional soy-based seasonings, developed in collaboration with DOST-ITDI.</p><ul><li>Low sodium</li><li>Gluten-free</li><li>Allergen-free</li><li>No MSG</li></ul>`,
    related: ['coco-balsamic', 'coco-vinegar', 'coco-syrup', 'coco-sugar'],
  },
  'virgin-coco-oil': {
    id: 'virgin-coco-oil',
    name: 'Virgin Coco Oil',
    price: 198,
    priceDisplay: 'PHP 198.00 – PHP 350.00',
    priceRange: { min: 198, max: 350 },
    variants: {
      label: 'Size',
      options: [
        { value: '250ml', label: '250ml', price: 198 },
        { value: '500ml', label: '500ml', price: 350 },
      ]
    },
    description: `<p>Cold-pressed from fresh coconut meat with no refining, bleaching, or deodorizing. The natural aroma, flavor, and full nutritional profile stay intact, including medium-chain triglycerides (MCTs).</p><ul><li>Cold-pressed</li><li>Unrefined</li><li>Rich in MCTs</li><li>No solvents or chemicals</li></ul>`,
    related: ['coco-seasoning', 'coco-sugar', 'coco-syrup', 'popcorn'],
  },
  'coco-syrup': {
    id: 'coco-syrup',
    name: 'Coco Syrup',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    variants: null,
    description: `<p>Amber liquid sweetener from fresh coconut sap. Low glycemic index, mild caramel flavor, and richer in nutrients than refined syrups. Great for pancakes, beverages, and baking.</p><ul><li>Low GI</li><li>All-natural</li><li>No artificial additives</li></ul>`,
    related: ['coco-sugar', 'coco-jam', 'virgin-coco-oil', 'popcorn'],
  },
  'coco-jam': {
    id: 'coco-jam',
    name: 'Coco Jam',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    variants: null,
    description: `<p>Slow-cooked from fresh coconut milk and coconut sugar until dark and rich. The Filipino pantry classic, made properly. No artificial flavors, no preservatives.</p><ul><li>Traditional recipe</li><li>No preservatives</li><li>All-natural</li></ul>`,
    related: ['coco-syrup', 'coco-sugar', 'coco-vinegar', 'popcorn'],
  },
  'coco-sugar': {
    id: 'coco-sugar',
    name: 'Coco Sugar',
    price: 120,
    priceDisplay: 'PHP 120.00 – PHP 400.00',
    priceRange: { min: 120, max: 400 },
    variants: {
      label: 'Size',
      options: [
        { value: '250g', label: '250g', price: 120 },
        { value: '500g', label: '500g', price: 200 },
        { value: '1kg', label: '1kg', price: 400 },
      ]
    },
    description: `<p>Made from 100% fresh coconut sap, minimally processed to retain its natural minerals, vitamins, and amino acids. GI of 35 — a tested, real alternative to refined sugar.</p><ul><li>GI of 35 (low glycemic)</li><li>All-natural</li><li>Diabetic-friendly</li><li>No additives</li></ul>`,
    related: ['coco-syrup', 'coco-jam', 'virgin-coco-oil', 'coco-seasoning'],
  },
};

/* ── Cart State (sessionStorage) ── */
const CART_KEY = 't2g_cart';

function getCart() {
  try { return JSON.parse(sessionStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
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
    html += `
    <div class="cart-item" data-key="${item.key}">
      <div class="ci-img"><span>${item.name}</span></div>
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
    <a href="checkout.html" class="btn btn-green cart-view-btn">View Cart</a>
    <a href="checkout.html" class="btn btn-green cart-checkout-btn">Checkout</a>
  </div>`;

  body.innerHTML = html;

  body.querySelectorAll('.ci-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
  });
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
      <div class="rel-img"><span>${r.name}</span></div>
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
        <div class="pm-img"><span>${prod.name}<br><small>Image placeholder</small></span></div>
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
        </div>
      </div>

      <!-- Tabs -->
      <div class="pm-tabs">
        <button class="pm-tab active" data-tab="description">Description</button>
        <button class="pm-tab" data-tab="info">Additional Information</button>
        <button class="pm-tab" data-tab="reviews">Reviews (0)</button>
      </div>
      <div class="pm-tab-content" id="pm-tab-description">${prod.description}</div>
      <div class="pm-tab-content" id="pm-tab-info" style="display:none;"><p style="color:var(--text-light);font-size:.88rem;">Additional information will be available soon.</p></div>
      <div class="pm-tab-content" id="pm-tab-reviews" style="display:none;"><p style="color:var(--text-light);font-size:.88rem;">No reviews yet.</p></div>

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
  initProductCards();
});
