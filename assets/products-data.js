/* ============================================================
   products-data.js
   THE single source of truth for all T2G products.
   Edit this file directly to add, change, or remove products.
   Dev Mode (Alt+1) saves back to localStorage as an override,
   but this file is the baseline that works on ALL browsers.
   ============================================================ */

window.T2G_PRODUCTS_DEFAULT = {
  'popcorn': {
    id: 'popcorn',
    name: 'Popcorn',
    price: 170,
    priceDisplay: 'PHP 170.00',
    priceRange: null,
    imageName: 'popcorn.png',
    variants: {
      label: 'Flavor',
      options: [
        { value: 'cheese-caramel',       label: 'Cheese Caramel',       price: 170 },
        { value: 'dark-choco-cranberry', label: 'Dark Choco Cranberry', price: 170 },
      ]
    },
    description: '<p>A guilt-free snack made from all-natural ingredients and sweetened only with T2G coco sugar and coco syrup. No artificial flavors, no preservatives.</p><ul><li>All-natural ingredients</li><li>Nutritious</li><li>No additives or preservatives</li></ul>',
    related: ['coco-balsamic', 'coco-sugar', 'coco-vinegar', 'coco-jam'],
  },
  'coco-balsamic': {
    id: 'coco-balsamic',
    name: 'Coco Balsamic Vinegar',
    price: 200,
    priceDisplay: 'PHP 200.00',
    priceRange: null,
    imageName: 'coco-balsamic.png',
    variants: null,
    description: '<p>Aged coconut sap vinegar with a deep, complex flavor. Dark, tangy, slightly sweet. Great for salad dressings, glazes, and gourmet dishes.</p><ul><li>Naturally fermented</li><li>All-natural</li><li>No additives</li></ul>',
    related: ['coco-vinegar', 'coco-seasoning', 'coco-syrup', 'coco-jam'],
  },
  'coco-vinegar': {
    id: 'coco-vinegar',
    name: 'Coco Vinegar',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    imageName: 'coco-vinegar.png',
    variants: null,
    description: '<p>Naturally fermented from fresh coconut sap. Milder and smoother than cane vinegar, with beneficial probiotic properties from the fermentation process itself.</p><ul><li>Naturally fermented</li><li>Probiotic</li><li>No additives or preservatives</li></ul>',
    related: ['coco-balsamic', 'coco-seasoning', 'coco-jam', 'coco-syrup'],
  },
  'coco-seasoning': {
    id: 'coco-seasoning',
    name: 'Coco Seasoning',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    imageName: 'coco-seasoning.png',
    variants: null,
    description: '<p>A coconut-based seasoning sauce made from coconut sap. Low in sodium, gluten-free, and allergen-free. A healthy alternative to traditional soy-based seasonings, developed with DOST-ITDI.</p><ul><li>Low sodium</li><li>Gluten-free</li><li>Allergen-free</li><li>No MSG</li></ul>',
    related: ['coco-balsamic', 'coco-vinegar', 'coco-syrup', 'coco-sugar'],
  },
  'virgin-coco-oil': {
    id: 'virgin-coco-oil',
    name: 'Virgin Coco Oil',
    price: 198,
    priceDisplay: 'PHP 198.00 - PHP 350.00',
    priceRange: { min: 198, max: 350 },
    imageName: 'virgin-coco-oil.png',
    variants: {
      label: 'Size',
      options: [
        { value: '250ml', label: '250ml', price: 198 },
        { value: '500ml', label: '500ml', price: 350 },
      ]
    },
    description: '<p>Cold-pressed from fresh coconut meat with no refining, bleaching, or deodorizing. The natural aroma, flavor, and full nutritional profile stay intact, including medium-chain triglycerides (MCTs).</p><ul><li>Cold-pressed</li><li>Unrefined</li><li>Rich in MCTs</li><li>No solvents or chemicals</li></ul>',
    related: ['coco-seasoning', 'coco-sugar', 'coco-syrup', 'popcorn'],
  },
  'coco-syrup': {
    id: 'coco-syrup',
    name: 'Coco Syrup',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    imageName: 'coco-syrup.png',
    variants: null,
    description: '<p>Amber liquid sweetener from fresh coconut sap. Low glycemic index, mild caramel flavor, and richer in nutrients than refined syrups. Great for pancakes, beverages, and baking.</p><ul><li>Low GI</li><li>All-natural</li><li>No artificial additives</li></ul>',
    related: ['coco-sugar', 'coco-jam', 'virgin-coco-oil', 'popcorn'],
  },
  'coco-jam': {
    id: 'coco-jam',
    name: 'Coco Jam',
    price: 165,
    priceDisplay: 'PHP 165.00',
    priceRange: null,
    imageName: 'coco-jam.png',
    variants: null,
    description: '<p>Slow-cooked from fresh coconut milk and coconut sugar until dark and rich. The Filipino pantry classic, made properly. No artificial flavors, no preservatives.</p><ul><li>Traditional recipe</li><li>No preservatives</li><li>All-natural</li></ul>',
    related: ['coco-syrup', 'coco-sugar', 'coco-vinegar', 'popcorn'],
  },
  'coco-sugar': {
    id: 'coco-sugar',
    name: 'Coco Sugar',
    price: 120,
    priceDisplay: 'PHP 120.00 - PHP 400.00',
    priceRange: { min: 120, max: 400 },
    imageName: 'coco-sugar.png',
    variants: {
      label: 'Size',
      options: [
        { value: '250g', label: '250g', price: 120 },
        { value: '500g', label: '500g', price: 200 },
        { value: '1kg',  label: '1kg',  price: 400 },
      ]
    },
    description: '<p>Made from 100% fresh coconut sap, minimally processed to retain its natural minerals, vitamins, and amino acids. GI of 35 - a tested, real alternative to refined sugar.</p><ul><li>GI of 35 (low glycemic)</li><li>All-natural</li><li>Diabetic-friendly</li><li>No additives</li></ul>',
    related: ['coco-syrup', 'coco-jam', 'virgin-coco-oil', 'coco-seasoning'],
  },
};
