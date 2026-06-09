/* ============================================================
   products-data.js
   THE single source of truth for all T2G products.
   Edit this file (or use Dev Mode Alt+4) to manage products.
   When you export from Dev Mode, paste the ENTIRE exported
   content here, replacing everything from line 1 downward.
   ============================================================ */

window.T2G_SHOPEE_URL = "https://shopee.ph/shop/1013182247";

window.T2G_PRODUCTS_DEFAULT = {
  "1": {
    "id": "1",
    "name": "TEST GOOD",
    "price": 100,
    "priceDisplay": "PHP 100.00",
    "priceRange": null,
    "variants": null,
    "description": "<p>Product description goes here.</p><ul><li>Feature one</li><li>Feature two</li></ul>",
    "related": [],
    "imageName": "product.png",
    "weightKg": 0.35,
    "shopeeUrl": null
  },
  "2": {
    "id": "2",
    "name": "TEST GOOD 2",
    "price": 160,
    "priceDisplay": "PHP 160.00",
    "priceRange": null,
    "variants": null,
    "description": "<p>Product description goes here.</p><ul><li>Feature one</li><li>Feature two</li></ul>",
    "related": ["1"],
    "imageName": "product1.png",
    "weightKg": 0.5,
    "shopeeUrl": null
  }
};

/* ── T2G_PRODUCTS is the live working copy.
   devmode.js will overwrite this with localStorage data if any exists.
   Always points to T2G_PRODUCTS_DEFAULT as the baseline. ── */
window.T2G_PRODUCTS = Object.assign({}, window.T2G_PRODUCTS_DEFAULT);
