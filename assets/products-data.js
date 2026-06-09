/* ============================================================
   products-data.js - exported from Dev Mode on 6/9/2026
   REPLACE the entire contents of assets/products-data.js with this.
   Then push to GitHub to make changes live on all browsers.
============================================================ */

window.T2G_SHOPEE_URL = "https://shopee.ph/shop/1013182247";

window.T2G_PRODUCTS_DEFAULT = {
  "coco-sugar": {
    "id": "coco-sugar",
    "name": "Coco Sugar",
    "price": 90,
    "priceDisplay": "PHP 90.00",
    "priceRange": null,
    "variants": null,
    "description": "<p>A natural alternative to refined sugar</p><ul><li>Made from 100% fresh coconut sap.</li><li>Low GI of 35</li></ul>",
    "related": [],
    "imageName": "product.png",
    "weightKg": 0.2,
    "shopeeUrl": null
  }
};

/* Live working copy - devmode.js will merge localStorage overrides on top f*/
window.T2G_PRODUCTS = Object.assign({}, window.T2G_PRODUCTS_DEFAULT);