/* ============================================================
   products-data.js - exported from Dev Mode on 6/7/2026
   REPLACE the entire contents of assets/products-data.js with this.
   Then push to GitHub to make changes live on all browsers.
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
    "related": [
      "1"
    ],
    "imageName": "product1.png",
    "weightKg": 0.5,
    "shopeeUrl": null
  },
  "3": {
    "id": "3",
    "name": "TEST GOOD 2",
    "price": 10,
    "priceDisplay": "PHP 10.00",
    "priceRange": null,
    "variants": null,
    "description": "<p>Product description goes here.</p><ul><li>Feature one</li><li>Feature two</li></ul>",
    "related": [
      "1",
      "2"
    ],
    "imageName": "product3.png",
    "weightKg": 0.5,
    "shopeeUrl": null
  }
};

/* Live working copy - devmode.js will merge localStorage overrides on top */
window.T2G_PRODUCTS = Object.assign({}, window.T2G_PRODUCTS_DEFAULT);