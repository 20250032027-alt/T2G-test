# T2G - Trunk to Gold Website

Multi-page static website and online store for **T2G (Trunk to Gold)**, a women-led coconut products social enterprise in Jasaan, Misamis Oriental, Philippines. Hosted on Vercel at https://www.trunktogold.com.

## Pages

| File | Page |
|------|------|
| `index.html` | Home (hero slider, best sellers, lifestyle slider) |
| `about.html` | About |
| `products.html` | Product grid (rendered from `products-data.js`) |
| `product.html` | Single product page, served at `/product/<id>` |
| `cart.html` | Cart |
| `checkout.html` | Checkout (pickup or shipping, GCash / BPI / cash) |
| `track.html` | Order tracking (reads a published Google Sheet) |
| `export.html` | Export inquiries |
| `faq.html` | FAQ |
| `blog.html`, `blog-post-1..4.html` | Blog |
| `contact.html` | Contact form |
| `privacy.html` | Privacy Policy (Data Privacy Act 2012) |
| `404.html` | Page-not-found page (Vercel uses it automatically) |
| `admin.html` | Admin dashboard at /admin (not indexed by search engines) |

## Assets

- `assets/site-config.js` - **settings you may need to change**: Supabase URL and key, email switches, tracking sheet link, contact details.
- `assets/products-data.js` - **the product catalogue** (names, prices, weights, images). Edit this to change products for everyone.
- `assets/cart.js` - cart state (sessionStorage), cart drawer, product modal. Cart prices are always re-read from the catalogue.
- `assets/products-render.js` - builds the product grid.
- `assets/main.js` - nav, sliders, FAQ accordion, scroll reveal, contact form, image shimmer.
- `assets/devmode.js` - in-browser product editor (see below).
- `assets/style.css` - all shared styles.
- `assets/img/` - images. See `IMAGE-FILES.md`.

## How orders flow

1. Customer checks out on `checkout.html`.
2. The order is saved in **Supabase** (`place_order`), which returns an Order ID like `T2G-261022-K7QM9`. If Supabase can't be reached, the order is emailed through Formspree instead, so checkout never stops working.
3. You get a Formspree email (optional once Supabase is set up, see `EMAIL_ON_ORDER`), and the customer gets a confirmation through EmailJS.
4. GCash/BPI customers upload a payment screenshot on the Order Placed screen. It is shrunk in the browser and stored privately in Supabase.
5. You manage the order at **/admin**: check the proof, move it through packing and shipping, add the courier tracking number.
6. Customers follow it on **/track**.

Setup: `SUPABASE-SETUP.md`. The old Google Sheet tracking (`TRACKING-SETUP.md`) is only needed for orders placed before Supabase.

## Admin page (`/admin`)

Sign in with the admin account created in `SUPABASE-SETUP.md`. Three tabs:

- **Orders**: what needs doing, filters, search, CSV download, and an order panel with customer details, payment proofs, status, courier and private notes.
- **Reviews**: approve, hide, reply to or delete product reviews. Nothing appears on the website until approved.
- **Usage**: database, file storage and Formspree usage against the free-plan limits, plus the 90-day payment proof clean-up.

## Supabase files

- `supabase/schema.sql` - tables, security rules and functions. Safe to re-run.
- `assets/t2g-db.js` - tiny client the public pages use to call Supabase.
- `assets/reviews.js` - product reviews (product page and quick view).
- `.github/workflows/supabase-keepalive.yml` - daily ping so the free project doesn't pause.

## Dev Mode (product editor)

Dev Mode is disabled for normal visitors. To use it in your own browser:

1. Visit any page with `?dev=1` added to the URL (e.g. `https://www.trunktogold.com/products?dev=1`). This is remembered in that browser.
2. Press **Alt+4** (Option+4 on Mac) to open the product manager.
3. Edits are saved only in that browser. A small "DEV" badge shows while local edits are active.
4. To publish: click **Export products-data.js**, replace `assets/products-data.js` with the output, and push to GitHub.
5. Visit with `?dev=0` to turn Dev Mode off again.

## Deploying to Vercel

Push to GitHub; Vercel redeploys automatically. No build step. `vercel.json` handles clean URLs (`/about` instead of `/about.html`) and `/product/<id>` rewrites.

When you add or remove products, also update `sitemap.xml` and the product structured data near the top of `index.html`. Reviews are linked to products by their `id`, so don't change an existing product's id.

## Design Notes

- **Colors:** Green `#45a349` (buttons `#3d9441`, hover `#327a35`), Gold `#D4A017`, Brown `#4A2C0A`
- **Fonts:** Playfair Display (headings) + Lato (body) + Dancing Script (accent)
- Fully responsive (mobile, tablet, desktop)
