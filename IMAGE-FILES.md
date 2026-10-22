# T2G Image Files Guide

Put all images in the `assets/img/` folder.
When you add a file with the exact filename listed below and push to GitHub,
it will appear automatically on the site without changing any code.

---

## Logo
| Filename | Notes |
|---|---|
| `logo.png` | Already present. Replace to update the site logo everywhere. |

---

## Home Page - Hero Slider
| Filename | Notes |
|---|---|
| `hero-slide-1.jpg` | First hero slide. Recommended: 1400 x 520 px, landscape photo |
| `hero-slide-2.jpg` | Second hero slide. Recommended: 1400 x 520 px, landscape photo |

---

## Home Page - Best Sellers Grid
Uses the same image files as the products below. The four cards are in `index.html`
(search for `bestsellers-grid`); prices update automatically from `products-data.js`.

---

## Home Page - Lifestyle Photo Slider (bottom section)
| Filename | Position |
|---|---|
| `lifestyle-1a.jpg` | Slide 1, left panel |
| `lifestyle-1b.jpg` | Slide 1, right panel |
| `lifestyle-2a.jpg` | Slide 2, left panel |
| `lifestyle-2b.jpg` | Slide 2, right panel |
| `lifestyle-3a.jpg` | Slide 3, left panel |
| `lifestyle-3b.jpg` | Slide 3, right panel |
| `lifestyle-4a.jpg` | Slide 4, left panel |
| `lifestyle-4b.jpg` | Slide 4, right panel |
| `lifestyle-5a.jpg` | Slide 5, left panel |
| `lifestyle-5b.jpg` | Slide 5, right panel |

---

## Home Page - Certification
| Filename | Certification |
|---|---|
| `cert-fda-ph.png` | FDA Philippines (the only active certification shown) |

---

## About Page
| Filename | Location |
|---|---|
| `about-banner.jpg`        | Full-width banner at top. Recommended: 1400 x 440 px |
| `about-why-experience.jpg`| Why T2G - card 1 (Our Experience). **Not added yet** (shows a logo block) |
| `about-why-quality.jpg`   | Why T2G - card 2 (Our Quality). **Not added yet** |
| `about-why-presence.jpg`  | Why T2G - card 3 (Our Presence). **Not added yet** |

---

## Products
Product images are set per product in `assets/products-data.js`:
`imageName` is the main image, `images` is the gallery on the product page.
Filenames must match exactly, including spaces and capital letters.

To change a product image: enable Dev Mode (visit any page with `?dev=1`, then press Alt+4),
click EDIT on the product, update the image filenames, export products-data.js, put the new
files in assets/img/, and push. Or edit `products-data.js` directly.

---

## Export Page
| Filename | Notes |
|---|---|
| `EXPORT-Cover-Photo.png` | Full-width world map banner. Recommended: 1400 x 320 px |

---

## Blog Page
| Filename | Blog Post |
|---|---|
| `blog-post-1.jpg` | T2G Breathes New Life into the Coconut Industry |
| `blog-post-2.jpg` | Why Coconut Tappers in Balingasag Earn More with T2G |
| `blog-post-3.jpg` | Coco Savor: T2G New Seasoning Sauce |
| `blog-post-4.jpg` | Bake Healthier with T2G Coco Sugar: Chocolate Chip Cookies |

---

## Tips
- JPG for photos (smaller file size). PNG for logos and products (transparent background).
- Compress before uploading at squoosh.app - aim for under 300 KB per image, about 900 px on the long side for product shots.
- Product images look best square (1:1 ratio).
- Hero and banner images: wide landscape, 16:5 or 16:6 ratio.
- All images in this list will fall back to a named placeholder if the file is missing,
  so the site always shows you exactly what filename to add.
