/* ============================================================
   T2G Developer Mode - devmode.js
   Activate: Alt+1 (or Option+1 on Mac)
   All product data stored in localStorage under 't2g_products'
   Falls back to T2G_PRODUCTS from cart.js if no saved data.
   ============================================================ */
'use strict';

(function() {

/* ── Dev mode state ── */
let DEV_ACTIVE = false;
const STORAGE_KEY = 't2g_products_v1';

/* ── Load/save product catalogue ── */
function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge into the live catalogue
      Object.assign(T2G_PRODUCTS, parsed);
    }
  } catch(e) { console.warn('T2G devmode: could not load saved products', e); }
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(T2G_PRODUCTS));
  } catch(e) { console.warn('T2G devmode: could not save products', e); }
}

/* ── Keybind: Alt+1 ── */
document.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === '1' || e.code === 'Digit1')) {
    e.preventDefault();
    toggleDevMode();
  }
});

function toggleDevMode() {
  DEV_ACTIVE = !DEV_ACTIVE;
  if (DEV_ACTIVE) {
    openDevPanel();
  } else {
    document.getElementById('t2g-dev-panel')?.remove();
    document.getElementById('t2g-dev-overlay')?.remove();
  }
}

/* ── Build the dev panel ── */
function openDevPanel() {
  if (document.getElementById('t2g-dev-panel')) return;

  const overlay = document.createElement('div');
  overlay.id = 't2g-dev-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) toggleDevMode();
  });

  const panel = document.createElement('div');
  panel.id = 't2g-dev-panel';
  panel.innerHTML = devPanelHTML();
  panel.style.cssText = `
    position:fixed;top:0;right:0;bottom:0;width:100%;max-width:680px;
    background:#fff;z-index:9001;display:flex;flex-direction:column;
    font-family:'Montserrat',system-ui,sans-serif;font-size:14px;
    box-shadow:-4px 0 32px rgba(0,0,0,.2);overflow:hidden;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  document.body.style.overflow = 'hidden';

  bindDevPanel(panel);
}

/* ── Panel HTML ── */
function devPanelHTML() {
  const products = Object.values(T2G_PRODUCTS);
  const rows = products.map(p => productRowHTML(p)).join('');
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;background:#1a1a1a;color:#fff;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="background:#43a047;color:#fff;font-size:.65rem;font-weight:800;letter-spacing:.1em;padding:3px 8px;border-radius:3px;text-transform:uppercase;">Dev Mode</span>
      <strong style="font-size:.9rem;">Product Manager</strong>
      <span style="font-size:.72rem;opacity:.5;letter-spacing:.06em;">Alt+1 to close</span>
    </div>
    <button id="dev-close" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer;padding:4px 8px;opacity:.7;">&times;</button>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #eee;flex-shrink:0;background:#f9f9f9;">
    <span style="font-size:.8rem;color:#666;">${products.length} products</span>
    <button id="dev-add-product" style="background:#43a047;color:#fff;border:none;padding:8px 18px;border-radius:3px;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;">+ Add New Product</button>
  </div>

  <div id="dev-product-list" style="flex:1;overflow-y:auto;padding:0;">
    ${rows}
  </div>

  <div style="padding:12px 20px;border-top:1px solid #eee;background:#f9f9f9;font-size:.75rem;color:#999;flex-shrink:0;display:flex;justify-content:space-between;align-items:center;">
    <span>Changes save automatically to your browser. <strong style="color:#333;">Reload any page to see updates.</strong></span>
    <button id="dev-reset" style="background:none;border:1px solid #ddd;padding:5px 12px;border-radius:3px;font-size:.72rem;color:#999;cursor:pointer;">Reset to Defaults</button>
  </div>
  `;
}

function productRowHTML(p) {
  const varCount = p.variants ? p.variants.options.length : 0;
  return `
  <div class="dev-prod-row" data-pid="${p.id}" style="border-bottom:1px solid #eee;padding:14px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:background .15s;" onmouseenter="this.style.background='#f9f9f9'" onmouseleave="this.style.background='#fff'">
    <div style="width:44px;height:44px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#aaa;text-align:center;flex-shrink:0;">IMG</div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:.88rem;color:#1a1a1a;margin-bottom:2px;">${p.name}</div>
      <div style="font-size:.75rem;color:#888;">${p.priceDisplay}${varCount ? ` &nbsp;&middot;&nbsp; ${varCount} variant${varCount>1?'s':''}` : ''}</div>
    </div>
    <div style="display:flex;gap:8px;flex-shrink:0;">
      <button class="dev-edit-btn" data-pid="${p.id}" style="background:#1a1a1a;color:#fff;border:none;padding:7px 14px;border-radius:3px;font-size:.72rem;font-weight:700;cursor:pointer;letter-spacing:.04em;">EDIT</button>
      <button class="dev-delete-btn" data-pid="${p.id}" style="background:none;border:1px solid #e0e0e0;color:#999;padding:7px 10px;border-radius:3px;font-size:.72rem;cursor:pointer;">DEL</button>
    </div>
  </div>`;
}

/* ── Edit modal ── */
function openEditModal(pid, isNew) {
  const existing = document.getElementById('dev-edit-modal');
  if (existing) existing.remove();

  const prod = pid ? JSON.parse(JSON.stringify(T2G_PRODUCTS[pid] || {})) : newProductTemplate();
  const allIds = Object.keys(T2G_PRODUCTS);

  const modal = document.createElement('div');
  modal.id = 'dev-edit-modal';
  modal.style.cssText = `
    position:absolute;inset:0;background:#fff;z-index:10;
    display:flex;flex-direction:column;overflow:hidden;
  `;

  // Variants JSON
  const variantsJSON = prod.variants ? JSON.stringify(prod.variants.options, null, 2) : '[]';

  // Related checkboxes
  const relatedChecks = allIds.filter(id => id !== prod.id).map(id => {
    const p = T2G_PRODUCTS[id];
    const checked = (prod.related || []).includes(id) ? 'checked' : '';
    return `<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;font-size:.82rem;color:#333;">
      <input type="checkbox" value="${id}" ${checked} style="width:15px;height:15px;accent-color:#43a047;cursor:pointer;">
      ${p ? p.name : id}
    </label>`;
  }).join('');

  modal.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #eee;background:#f9f9f9;flex-shrink:0;">
    <strong style="font-size:.9rem;">${isNew ? 'New Product' : 'Edit: ' + (prod.name || '')}</strong>
    <button id="dev-modal-back" style="background:none;border:none;font-size:.8rem;color:#43a047;cursor:pointer;font-weight:700;letter-spacing:.04em;">&#8592; Back</button>
  </div>
  <div style="flex:1;overflow-y:auto;padding:20px;">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
      <div>
        <label style="${labelStyle}">Product ID <span style="color:#999;font-weight:400;">(no spaces, e.g. coco-sugar)</span></label>
        <input id="ep-id" value="${prod.id || ''}" ${pid && !isNew ? 'readonly style="background:#f5f5f5;cursor:not-allowed;' : ''}${inputStyle2}>
      </div>
      <div>
        <label style="${labelStyle}">Product Name</label>
        <input id="ep-name" value="${prod.name || ''}" ${inputStyle2}>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <label style="${labelStyle}">Price Display <span style="color:#999;font-weight:400;">(e.g. PHP 165.00 or PHP 120.00 - PHP 400.00)</span></label>
      <input id="ep-price-display" value="${prod.priceDisplay || ''}" ${inputStyle2}>
    </div>

    <div style="margin-bottom:16px;">
      <label style="${labelStyle}">Base Price (PHP, number only)</label>
      <input id="ep-price" type="number" value="${prod.price || ''}" ${inputStyle2}>
    </div>

    <div style="margin-bottom:16px;">
      <label style="${labelStyle}">Description (HTML allowed)</label>
      <textarea id="ep-desc" rows="5" style="${textareaStyle}">${prod.description || ''}</textarea>
    </div>

    <div style="margin-bottom:16px;">
      <label style="${labelStyle}">Variants</label>
      <div style="margin-bottom:8px;display:flex;gap:10px;align-items:center;">
        <label style="display:flex;align-items:center;gap:6px;font-size:.8rem;cursor:pointer;">
          <input type="radio" name="ep-var-type" value="none" ${!prod.variants ? 'checked' : ''} style="accent-color:#43a047;"> No variants (single price)
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:.8rem;cursor:pointer;">
          <input type="radio" name="ep-var-type" value="has" ${prod.variants ? 'checked' : ''} style="accent-color:#43a047;"> Has variants
        </label>
      </div>
      <div id="ep-variants-wrap" style="display:${prod.variants ? 'block' : 'none'};">
        <div style="margin-bottom:6px;display:flex;gap:10px;align-items:center;">
          <label style="${labelStyle}">Variant label <span style="color:#999;font-weight:400;">(e.g. Flavor, Size)</span></label>
          <input id="ep-var-label" value="${prod.variants ? prod.variants.label : 'Flavor'}" style="padding:6px 10px;border:1px solid #ddd;border-radius:3px;font-size:.82rem;flex:1;">
        </div>
        <label style="${labelStyle}">Options JSON <span style="color:#999;font-weight:400;">[{"value":"id","label":"Name","price":165}]</span></label>
        <textarea id="ep-var-json" rows="6" style="${textareaStyle};font-family:monospace;font-size:.8rem;">${variantsJSON}</textarea>
        <button id="ep-add-variant" style="margin-top:6px;background:none;border:1px solid #43a047;color:#43a047;padding:5px 12px;border-radius:3px;font-size:.72rem;cursor:pointer;">+ Add variant row</button>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <label style="${labelStyle}">Related Products</label>
      <div style="border:1px solid #eee;border-radius:3px;padding:12px;max-height:200px;overflow-y:auto;">
        ${relatedChecks || '<span style="font-size:.8rem;color:#aaa;">No other products yet.</span>'}
      </div>
    </div>

    <div style="display:flex;gap:10px;padding-top:8px;">
      <button id="ep-save" style="flex:1;background:#43a047;color:#fff;border:none;padding:12px;border-radius:3px;font-size:.82rem;font-weight:800;letter-spacing:.06em;cursor:pointer;text-transform:uppercase;">Save Product</button>
      ${!isNew ? `<button id="ep-delete" style="background:#fff;border:1px solid #e0e0e0;color:#999;padding:12px 20px;border-radius:3px;font-size:.8rem;cursor:pointer;">Delete</button>` : ''}
    </div>

  </div>`;

  const panel = document.getElementById('t2g-dev-panel');
  panel.appendChild(modal);

  // Variant radio toggle
  modal.querySelectorAll('input[name="ep-var-type"]').forEach(r => {
    r.addEventListener('change', () => {
      modal.querySelector('#ep-variants-wrap').style.display = r.value === 'has' ? 'block' : 'none';
    });
  });

  // Add variant shortcut
  modal.querySelector('#ep-add-variant')?.addEventListener('click', () => {
    try {
      const ta = modal.querySelector('#ep-var-json');
      const arr = JSON.parse(ta.value || '[]');
      arr.push({ value: 'new-variant', label: 'New Variant', price: 165 });
      ta.value = JSON.stringify(arr, null, 2);
    } catch(e) { alert('Fix the JSON first.'); }
  });

  // Back
  modal.querySelector('#dev-modal-back').addEventListener('click', () => {
    modal.remove();
    // Refresh list
    const list = document.getElementById('dev-product-list');
    if (list) list.innerHTML = Object.values(T2G_PRODUCTS).map(p => productRowHTML(p)).join('');
    bindProductRows(panel);
  });

  // Save
  modal.querySelector('#ep-save').addEventListener('click', () => {
    const id = modal.querySelector('#ep-id').value.trim().toLowerCase().replace(/\s+/g, '-');
    const name = modal.querySelector('#ep-name').value.trim();
    if (!id || !name) { alert('ID and Name are required.'); return; }

    const hasVar = modal.querySelector('input[name="ep-var-type"]:checked').value === 'has';
    let variants = null;
    if (hasVar) {
      try {
        const opts = JSON.parse(modal.querySelector('#ep-var-json').value);
        if (!Array.isArray(opts) || opts.length === 0) throw new Error('empty');
        variants = {
          label: modal.querySelector('#ep-var-label').value.trim() || 'Option',
          options: opts
        };
      } catch(e) { alert('Variants JSON is invalid. Fix it before saving.'); return; }
    }

    // Related
    const related = [];
    modal.querySelectorAll('#dev-edit-modal input[type="checkbox"]:checked').forEach(cb => related.push(cb.value));

    const basePrice = parseFloat(modal.querySelector('#ep-price').value) || (variants ? variants.options[0].price : 165);
    const priceDisplay = modal.querySelector('#ep-price-display').value.trim() || `PHP ${basePrice.toFixed(2)}`;

    // If ID changed (new product), remove old
    if (pid && id !== pid && T2G_PRODUCTS[pid]) {
      delete T2G_PRODUCTS[pid];
    }

    T2G_PRODUCTS[id] = {
      id,
      name,
      price: basePrice,
      priceDisplay,
      priceRange: variants ? { min: Math.min(...variants.options.map(o=>o.price)), max: Math.max(...variants.options.map(o=>o.price)) } : null,
      variants,
      description: modal.querySelector('#ep-desc').value.trim(),
      related,
    };

    saveProducts();

    // Refresh list
    modal.remove();
    const list = document.getElementById('dev-product-list');
    if (list) list.innerHTML = Object.values(T2G_PRODUCTS).map(p => productRowHTML(p)).join('');
    bindProductRows(panel);

    // Flash confirmation
    showToast(`"${name}" saved. Reload products page to see it live.`);
  });

  // Delete from edit modal
  modal.querySelector('#ep-delete')?.addEventListener('click', () => {
    if (!confirm(`Delete "${prod.name}"? This cannot be undone.`)) return;
    deleteProduct(prod.id);
    modal.remove();
    const list = document.getElementById('dev-product-list');
    if (list) list.innerHTML = Object.values(T2G_PRODUCTS).map(p => productRowHTML(p)).join('');
    bindProductRows(panel);
    showToast(`"${prod.name}" deleted.`);
  });
}

/* ── Bind panel buttons ── */
function bindDevPanel(panel) {
  panel.querySelector('#dev-close')?.addEventListener('click', toggleDevMode);
  panel.querySelector('#dev-add-product')?.addEventListener('click', () => openEditModal(null, true));
  panel.querySelector('#dev-reset')?.addEventListener('click', () => {
    if (!confirm('This will remove all your custom product edits and restore the defaults. Are you sure?')) return;
    localStorage.removeItem(STORAGE_KEY);
    // Re-load defaults by refreshing
    location.reload();
  });
  bindProductRows(panel);
}

function bindProductRows(panel) {
  panel.querySelectorAll('.dev-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(btn.dataset.pid, false);
    });
  });
  panel.querySelectorAll('.dev-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.pid;
      const prod = T2G_PRODUCTS[pid];
      if (!confirm(`Delete "${prod?.name}"?`)) return;
      deleteProduct(pid);
      btn.closest('.dev-prod-row').remove();
      showToast(`"${prod?.name}" deleted.`);
    });
  });
}

function deleteProduct(pid) {
  delete T2G_PRODUCTS[pid];
  saveProducts();
}

/* ── Toast notification ── */
function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
    background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:4px;
    font-size:.82rem;z-index:9999;font-family:'Montserrat',sans-serif;
    animation:toastIn .25s ease forwards;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ── CSS helpers ── */
const labelStyle = 'display:block;font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#333;margin-bottom:6px;';
const inputStyle2 = `style="width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:3px;font-size:.85rem;outline:none;font-family:inherit;transition:border-color .2s;" onfocus="this.style.borderColor='#43a047'" onblur="this.style.borderColor='#ddd'"`;
const textareaStyle = 'width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:3px;font-size:.85rem;outline:none;font-family:inherit;resize:vertical;transition:border-color .2s;';

/* ── New product template ── */
function newProductTemplate() {
  return {
    id: '',
    name: '',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    variants: null,
    description: '<p>Product description goes here.</p><ul><li>Feature one</li><li>Feature two</li></ul>',
    related: [],
  };
}

/* ── Init: load saved products on every page ── */
document.addEventListener('DOMContentLoaded', loadProducts);

/* ── Dev mode indicator (subtle badge in corner when on products page) ── */
document.addEventListener('DOMContentLoaded', () => {
  const hint = document.createElement('div');
  hint.style.cssText = `
    position:fixed;bottom:12px;right:12px;background:rgba(0,0,0,.55);color:#fff;
    font-size:.62rem;padding:4px 9px;border-radius:3px;z-index:100;
    font-family:'Montserrat',system-ui,sans-serif;letter-spacing:.06em;
    pointer-events:none;opacity:.5;
  `;
  hint.textContent = 'Alt+1 Dev Mode';
  document.body.appendChild(hint);
});

})();
