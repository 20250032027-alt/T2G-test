/* ============================================================
   T2G Developer Mode - devmode.js
   Activate: Alt+4 (or Option+4 on Mac)
   Products saved to localStorage under 't2g_products_v2'
   ============================================================ */
'use strict';

(function() {

const STORAGE_KEY = 't2g_products_v2';
let DEV_ACTIVE = false;

/* ── Load saved products - REPLACES defaults entirely if any saved data exists ── */
function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clear ALL existing keys first so deletions are respected
      Object.keys(T2G_PRODUCTS).forEach(k => delete T2G_PRODUCTS[k]);
      // Then apply saved data
      Object.assign(T2G_PRODUCTS, parsed);
    }
  } catch(e) { console.warn('T2G devmode: could not load saved products', e); }
}

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(T2G_PRODUCTS));
  } catch(e) { console.warn('T2G devmode: could not save products', e); }
}

/* ── Keybind: Alt+4 ── */
document.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === '4' || e.code === 'Digit4')) {
    e.preventDefault();
    toggleDevMode();
  }
});

/* ── Toggle ── */
function toggleDevMode() {
  DEV_ACTIVE = !DEV_ACTIVE;
  if (DEV_ACTIVE) {
    openDevPanel();
  } else {
    closeDevPanel();
  }
}

function closeDevPanel() {
  DEV_ACTIVE = false;
  document.getElementById('t2g-dev-panel')?.remove();
  document.getElementById('t2g-dev-overlay')?.remove();
  document.body.style.overflow = ''; // CRITICAL: always restore scroll
}

/* ── Open panel ── */
function openDevPanel() {
  if (document.getElementById('t2g-dev-panel')) return;

  const overlay = document.createElement('div');
  overlay.id = 't2g-dev-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9000;';
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDevPanel(); });

  const panel = document.createElement('div');
  panel.id = 't2g-dev-panel';
  panel.style.cssText = `
    position:fixed;top:0;right:0;bottom:0;width:100%;max-width:680px;
    background:#fff;z-index:9001;display:flex;flex-direction:column;
    font-family:'Montserrat',system-ui,sans-serif;font-size:14px;
    box-shadow:-4px 0 32px rgba(0,0,0,.2);overflow:hidden;
  `;

  panel.innerHTML = buildPanelHTML();
  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  document.body.style.overflow = 'hidden';
  bindDevPanel(panel);
}

/* ── Panel HTML ── */
function buildPanelHTML() {
  const products = Object.values(T2G_PRODUCTS);
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #eee;background:#1a1a1a;color:#fff;flex-shrink:0;">
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="background:#43a047;color:#fff;font-size:.65rem;font-weight:800;letter-spacing:.1em;padding:3px 8px;border-radius:3px;text-transform:uppercase;">Dev Mode</span>
      <strong style="font-size:.9rem;">Product Manager</strong>
      <span style="font-size:.72rem;opacity:.5;letter-spacing:.06em;">Alt+4 to close</span>
    </div>
    <button id="dev-close" style="background:none;border:none;color:#fff;font-size:1.4rem;cursor:pointer;padding:4px 10px;opacity:.7;line-height:1;">&times;</button>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid #eee;flex-shrink:0;background:#f9f9f9;">
    <span style="font-size:.78rem;color:#666;" id="dev-count">${products.length} product${products.length !== 1 ? 's' : ''}</span>
    <button id="dev-add-product" style="background:#43a047;color:#fff;border:none;padding:8px 18px;border-radius:3px;font-size:.75rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;">+ Add Product</button>
  </div>
  <div id="dev-product-list" style="flex:1;overflow-y:auto;">
    ${Object.values(T2G_PRODUCTS).map(p => productRowHTML(p)).join('') || '<p style="padding:20px;color:#aaa;font-size:.85rem;">No products yet. Click Add Product.</p>'}
  </div>
  <div style="padding:10px 20px;border-top:1px solid #eee;background:#f9f9f9;flex-shrink:0;">
    <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:10px 14px;margin-bottom:10px;font-size:.75rem;color:#856404;line-height:1.55;">
      <strong>To sync products across devices:</strong> click "Export cart.js" below, download the file, replace <code style="background:rgba(0,0,0,.07);padding:1px 4px;border-radius:2px;">assets/cart.js</code> in your project folder with it, then push to GitHub. Every device will then see the same products.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
      <button id="dev-export" style="background:#1a1a1a;color:#fff;border:none;padding:8px 16px;border-radius:3px;font-size:.75rem;font-weight:700;letter-spacing:.06em;cursor:pointer;text-transform:uppercase;">Download cart.js</button>
      <button id="dev-reset" style="white-space:nowrap;background:none;border:1px solid #ddd;padding:7px 12px;border-radius:3px;font-size:.72rem;color:#999;cursor:pointer;">Reset to Defaults</button>
    </div>
  </div>`;
}

/* ── Product row ── */
function productRowHTML(p) {
  const varCount = p.variants ? p.variants.options.length : 0;
  // Image filename: use stored imageName or derive from id
  const imgName = p.imageName || (p.id + '.png');
  return `
  <div class="dev-prod-row" data-pid="${p.id}" style="border-bottom:1px solid #f0f0f0;padding:12px 20px;display:flex;align-items:center;gap:12px;">
    <div style="width:40px;height:40px;background:#f5f5f5;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:.55rem;color:#bbb;text-align:center;flex-shrink:0;line-height:1.3;padding:3px;">${imgName}</div>
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:.88rem;color:#1a1a1a;margin-bottom:2px;">${p.name}</div>
      <div style="font-size:.74rem;color:#888;">${p.priceDisplay}${varCount ? ' &nbsp;&middot;&nbsp; ' + varCount + ' variant' + (varCount > 1 ? 's' : '') : ''} &nbsp;&middot;&nbsp; img: <code style="background:#f0f0f0;padding:1px 4px;border-radius:2px;font-size:.7rem;">${imgName}</code></div>
    </div>
    <div style="display:flex;gap:6px;flex-shrink:0;">
      <button class="dev-edit-btn" data-pid="${p.id}" style="background:#1a1a1a;color:#fff;border:none;padding:6px 13px;border-radius:3px;font-size:.72rem;font-weight:700;cursor:pointer;">EDIT</button>
      <button class="dev-delete-btn" data-pid="${p.id}" style="background:#fff;border:1px solid #e0e0e0;color:#cc3333;padding:6px 10px;border-radius:3px;font-size:.72rem;cursor:pointer;font-weight:700;">DEL</button>
    </div>
  </div>`;
}

/* ── Edit/New modal ── */
function openEditModal(pid, isNew) {
  document.getElementById('dev-edit-modal')?.remove();
  const prod = pid ? JSON.parse(JSON.stringify(T2G_PRODUCTS[pid])) : newProductTemplate();
  const allIds = Object.keys(T2G_PRODUCTS);
  const panel = document.getElementById('t2g-dev-panel');

  const variantsJSON = prod.variants ? JSON.stringify(prod.variants.options, null, 2) : '[]';
  const imgName = prod.imageName || (prod.id ? prod.id + '.png' : 'product.png');

  const relatedChecks = allIds.filter(id => id !== prod.id).map(id => {
    const p = T2G_PRODUCTS[id];
    const checked = (prod.related || []).includes(id) ? 'checked' : '';
    return `<label style="display:flex;align-items:center;gap:8px;margin-bottom:7px;cursor:pointer;font-size:.82rem;color:#333;">
      <input type="checkbox" value="${id}" ${checked} style="width:15px;height:15px;accent-color:#43a047;cursor:pointer;">
      ${p ? p.name : id}
    </label>`;
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'dev-edit-modal';
  modal.style.cssText = 'position:absolute;inset:0;background:#fff;z-index:10;display:flex;flex-direction:column;overflow:hidden;';

  const LS = 'display:block;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#444;margin-bottom:5px;';
  const IS = `style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:3px;font-size:.85rem;outline:none;font-family:inherit;" onfocus="this.style.borderColor='#43a047'" onblur="this.style.borderColor='#ddd'"`;
  const TS = 'width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:3px;font-size:.85rem;outline:none;font-family:inherit;resize:vertical;';

  modal.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 20px;border-bottom:1px solid #eee;background:#f9f9f9;flex-shrink:0;">
    <strong style="font-size:.88rem;">${isNew ? 'New Product' : 'Edit: ' + (prod.name || '')}</strong>
    <button id="dev-modal-back" style="background:none;border:none;font-size:.8rem;color:#43a047;cursor:pointer;font-weight:700;">&#8592; Back to list</button>
  </div>
  <div style="flex:1;overflow-y:auto;padding:20px 20px 32px;">

    <div style="background:#f0f8f0;border:1px solid #c3e6cb;border-radius:4px;padding:10px 14px;margin-bottom:18px;font-size:.78rem;color:#2d6a31;line-height:1.55;">
      <strong>Image filename tip:</strong> The image filename field below tells the site which file to use. Put a matching image file in <code style="background:rgba(0,0,0,.07);padding:1px 5px;border-radius:2px;">assets/img/</code> and it will show automatically after your next deploy.
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div>
        <label style="${LS}">Product ID <span style="color:#aaa;font-weight:400;">(e.g. 1, 2, or coco-sugar)</span></label>
        <input id="ep-id" value="${prod.id || ''}" ${pid && !isNew ? 'readonly style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:3px;font-size:.85rem;background:#f5f5f5;font-family:inherit;"' : IS}>
      </div>
      <div>
        <label style="${LS}">Product Name</label>
        <input id="ep-name" value="${prod.name || ''}" ${IS}>
      </div>
    </div>

    <div style="margin-bottom:14px;">
      <label style="${LS}">Image Filename <span style="color:#aaa;font-weight:400;">(file to look for in assets/img/)</span></label>
      <input id="ep-img" value="${imgName}" ${IS} placeholder="e.g. coco-sugar.png">
    </div>

    <div style="margin-bottom:14px;">
      <label style="${LS}">Shopee Product URL <span style="color:#aaa;font-weight:400;">(optional - specific listing link)</span></label>
      <input id="ep-shopee" value="${prod.shopeeUrl || ''}" ${IS} placeholder="https://shopee.ph/product/1013182247/xxxxx">
      <p style="font-size:.72rem;color:#aaa;margin-top:4px;">Leave blank to use the general shop link. Paste the URL of this specific product on Shopee.</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div>
        <label style="${LS}">Base Price (PHP number)</label>
        <input id="ep-price" type="number" value="${prod.price || 165}" ${IS}>
      </div>
      <div>
        <label style="${LS}">Price Display <span style="color:#aaa;font-weight:400;">(shown on card)</span></label>
        <input id="ep-price-display" value="${prod.priceDisplay || ''}" ${IS} placeholder="PHP 165.00">
      </div>
    </div>

    <div style="margin-bottom:14px;">
      <label style="${LS}">Weight per unit (kg) <span style="color:#aaa;font-weight:400;">for shipping calculator</span></label>
      <div style="display:flex;align-items:center;gap:10px;">
        <input id="ep-weight" type="number" step="0.001" min="0" value="${prod.weightKg !== null && prod.weightKg !== undefined ? prod.weightKg : ''}" ${IS} style="max-width:160px;" placeholder="e.g. 0.350">
        <span style="font-size:.75rem;color:#aaa;line-height:1.4;">kg per unit.<br>Leave blank if unknown.</span>
      </div>
      <p style="font-size:.72rem;color:#43a047;margin-top:5px;line-height:1.5;">
        Once set, checkout will auto-calculate shipping cost based on quantity ordered.
      </p>
    </div>

    <div style="margin-bottom:14px;">
      <label style="${LS}">Description (HTML allowed)</label>
      <textarea id="ep-desc" rows="5" style="${TS}">${prod.description || ''}</textarea>
    </div>

    <div style="margin-bottom:14px;">
      <label style="${LS}">Variants</label>
      <div style="display:flex;gap:20px;margin-bottom:10px;">
        <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;cursor:pointer;">
          <input type="radio" name="ep-vt" value="none" ${!prod.variants ? 'checked' : ''} style="accent-color:#43a047;"> No variants
        </label>
        <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;cursor:pointer;">
          <input type="radio" name="ep-vt" value="has" ${prod.variants ? 'checked' : ''} style="accent-color:#43a047;"> Has variants
        </label>
      </div>
      <div id="ep-vwrap" style="display:${prod.variants ? 'block' : 'none'};">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <label style="${LS};margin:0;white-space:nowrap;">Label (e.g. Flavor, Size)</label>
          <input id="ep-var-label" value="${prod.variants ? prod.variants.label : 'Flavor'}" style="flex:1;padding:7px 10px;border:1px solid #ddd;border-radius:3px;font-size:.82rem;outline:none;font-family:inherit;">
        </div>
        <label style="${LS}">Options JSON</label>
        <div style="font-size:.72rem;color:#aaa;margin-bottom:5px;">[{"value":"cheese-caramel","label":"Cheese Caramel","price":170}]</div>
        <textarea id="ep-var-json" rows="5" style="${TS};font-family:monospace;font-size:.78rem;">${variantsJSON}</textarea>
        <button id="ep-add-variant" style="margin-top:6px;background:none;border:1px solid #43a047;color:#43a047;padding:5px 12px;border-radius:3px;font-size:.72rem;cursor:pointer;font-weight:700;">+ Add option row</button>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <label style="${LS}">Related Products</label>
      <div style="border:1px solid #eee;border-radius:4px;padding:12px;max-height:180px;overflow-y:auto;">
        ${relatedChecks || '<span style="font-size:.8rem;color:#bbb;">No other products yet.</span>'}
      </div>
    </div>

    <div style="display:flex;gap:10px;">
      <button id="ep-save" style="flex:1;background:#43a047;color:#fff;border:none;padding:12px;border-radius:3px;font-size:.82rem;font-weight:800;letter-spacing:.06em;cursor:pointer;text-transform:uppercase;">Save Product</button>
      ${!isNew ? `<button id="ep-delete" style="background:#fff;border:1px solid #ffcccc;color:#cc3333;padding:12px 20px;border-radius:3px;font-size:.8rem;cursor:pointer;font-weight:700;">Delete</button>` : ''}
    </div>

  </div>`;

  panel.appendChild(modal);

  /* Variant toggle */
  modal.querySelectorAll('input[name="ep-vt"]').forEach(r => {
    r.addEventListener('change', () => {
      modal.querySelector('#ep-vwrap').style.display = r.value === 'has' ? 'block' : 'none';
    });
  });

  /* Add variant row */
  modal.querySelector('#ep-add-variant')?.addEventListener('click', () => {
    try {
      const ta = modal.querySelector('#ep-var-json');
      const arr = JSON.parse(ta.value || '[]');
      arr.push({ value: 'option-' + (arr.length + 1), label: 'Option ' + (arr.length + 1), price: 165 });
      ta.value = JSON.stringify(arr, null, 2);
    } catch(e) { alert('Fix the JSON first before adding a row.'); }
  });

  /* Back */
  modal.querySelector('#dev-modal-back').addEventListener('click', () => {
    modal.remove();
    refreshList(panel);
  });

  /* Save */
  modal.querySelector('#ep-save').addEventListener('click', () => {
    const id = modal.querySelector('#ep-id').value.trim().replace(/\s+/g, '-');
    const name = modal.querySelector('#ep-name').value.trim();
    if (!id || !name) { alert('ID and Name are required.'); return; }

    const hasVar = modal.querySelector('input[name="ep-vt"]:checked').value === 'has';
    let variants = null;
    if (hasVar) {
      try {
        const opts = JSON.parse(modal.querySelector('#ep-var-json').value);
        if (!Array.isArray(opts) || opts.length === 0) throw new Error();
        variants = { label: modal.querySelector('#ep-var-label').value.trim() || 'Option', options: opts };
      } catch(e) { alert('Variants JSON is invalid. Check the format and try again.'); return; }
    }

    const related = [];
    modal.querySelectorAll('#dev-edit-modal input[type="checkbox"]:checked').forEach(cb => related.push(cb.value));

    const basePrice = parseFloat(modal.querySelector('#ep-price').value) || 165;
    const priceDisplay = modal.querySelector('#ep-price-display').value.trim() || `PHP ${basePrice.toFixed(2)}`;
    const imageName = modal.querySelector('#ep-img').value.trim() || id + '.png';
    const shopeeUrl = modal.querySelector('#ep-shopee').value.trim() || null;

    // Remove old key if ID changed
    if (pid && id !== pid) delete T2G_PRODUCTS[pid];

    const weightVal = modal.querySelector('#ep-weight').value.trim();
    const weightKg = weightVal !== '' && !isNaN(parseFloat(weightVal)) ? parseFloat(weightVal) : null;

    T2G_PRODUCTS[id] = {
      id, name, price: basePrice, priceDisplay,
      priceRange: variants ? { min: Math.min(...variants.options.map(o => o.price)), max: Math.max(...variants.options.map(o => o.price)) } : null,
      variants,
      description: modal.querySelector('#ep-desc').value.trim(),
      related,
      imageName,
      weightKg,
      shopeeUrl,
    };

    saveProducts();
    modal.remove();
    refreshList(panel);
    showToast('"' + name + '" saved. Reload products page to see it live.');
  });

  /* Delete from edit modal */
  modal.querySelector('#ep-delete')?.addEventListener('click', () => {
    if (!confirm('Delete "' + prod.name + '"? This cannot be undone.')) return;
    delete T2G_PRODUCTS[prod.id];
    saveProducts();
    modal.remove();
    refreshList(panel);
    showToast('"' + prod.name + '" deleted.');
  });
}

/* ── Refresh product list in panel ── */
function refreshList(panel) {
  const list = panel.querySelector('#dev-product-list');
  const count = panel.querySelector('#dev-count');
  const products = Object.values(T2G_PRODUCTS);
  if (list) list.innerHTML = products.map(p => productRowHTML(p)).join('') || '<p style="padding:20px;color:#aaa;font-size:.85rem;">No products. Click Add Product.</p>';
  if (count) count.textContent = products.length + ' product' + (products.length !== 1 ? 's' : '');
  bindProductRows(panel);
}

/* ── Bind panel buttons ── */
function bindDevPanel(panel) {
  panel.querySelector('#dev-close').addEventListener('click', closeDevPanel);
  panel.querySelector('#dev-add-product').addEventListener('click', () => openEditModal(null, true));
  panel.querySelector('#dev-export')?.addEventListener('click', () => {
    const data = JSON.stringify(T2G_PRODUCTS, null, 2);
    const output = `/* ============================================================
   products-data.js - exported from Dev Mode on ${new Date().toLocaleDateString()}
   Paste this entire file content into assets/products-data.js
   then push to GitHub to make changes live on all browsers.
============================================================ */

window.T2G_PRODUCTS_DEFAULT = ${data};`;
    // Copy to clipboard
    navigator.clipboard.writeText(output).then(() => {
      showToast('Copied! Paste into assets/products-data.js and push to GitHub.');
    }).catch(() => {
      // Fallback: show in a textarea
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
      overlay.innerHTML = `<div style="background:#fff;border-radius:6px;padding:24px;width:100%;max-width:600px;max-height:80vh;display:flex;flex-direction:column;gap:12px;">
        <strong style="font-size:.9rem;">Copy this into assets/products-data.js</strong>
        <textarea style="flex:1;min-height:300px;font-family:monospace;font-size:.75rem;border:1px solid #ddd;border-radius:3px;padding:10px;resize:none;" readonly>${output.replace(/</g,'&lt;')}</textarea>
        <button onclick="this.closest('div').parentElement.remove()" style="background:#1a1a1a;color:#fff;border:none;padding:10px;border-radius:3px;cursor:pointer;font-size:.82rem;">Close</button>
      </div>`;
      document.body.appendChild(overlay);
    });
  });

  panel.querySelector('#dev-reset').addEventListener('click', () => {
    if (!confirm('Reset all products to defaults? Your custom changes will be lost.')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
  bindProductRows(panel);
}

function bindProductRows(panel) {
  panel.querySelectorAll('.dev-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEditModal(btn.dataset.pid, false); });
  });
  panel.querySelectorAll('.dev-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.dataset.pid;
      const name = T2G_PRODUCTS[pid]?.name || pid;
      if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
      delete T2G_PRODUCTS[pid];
      saveProducts();
      btn.closest('.dev-prod-row').remove();
      // Update count
      const count = document.querySelector('#dev-count');
      const n = Object.keys(T2G_PRODUCTS).length;
      if (count) count.textContent = n + ' product' + (n !== 1 ? 's' : '');
      showToast('"' + name + '" deleted.');
    });
  });
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:4px;font-size:.82rem;z-index:99999;font-family:Montserrat,sans-serif;white-space:nowrap;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ── New product template ── */
function newProductTemplate() {
  return { id: '', name: '', price: 165, priceDisplay: 'PHP 165.00', priceRange: null, variants: null, description: '<p>Product description goes here.</p><ul><li>Feature one</li><li>Feature two</li></ul>', related: [], imageName: 'product.png' };
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', loadProducts);



})();
