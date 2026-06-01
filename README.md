# T2G — Trunk to Gold Website

A multi-page static website for **T2G (Trunk to Gold)**, a premium coconut products company based in Cagayan de Oro, Northern Mindanao, Philippines.

## Pages

| File | Page |
|------|------|
| `index.html` | Home |
| `about.html` | About |
| `products.html` | Products |
| `export.html` | Export |
| `faq.html` | FAQ |
| `blog.html` | Blog (coming soon placeholder) |
| `contact.html` | Contact |

## Assets

- `assets/style.css` — all styles (single stylesheet)
- `assets/main.js` — mobile nav, hero slider, FAQ accordion, scroll reveal
- `assets/img/logo.png` — T2G logo (replace with final assets as needed)

## Placeholders to Replace

1. **Images** — All `img-placeholder` divs throughout the site should be replaced with `<img>` tags once product/farm photos are ready.
2. **Phone numbers** — Replace `+63 917 XXX XXXX` with actual numbers.
3. **Email** — Replace `trunk2gold@gmail.com` with actual email.
4. **Address** — Update if different from Cagayan de Oro.
5. **Contact form** — Hook up `handleSubmit()` in `contact.html` to a form backend (Formspree, Netlify Forms, Resend, etc.).
6. **Blog** — Add actual blog posts when ready.
7. **Google Maps** — Add iframe embed in `contact.html` map placeholder section.

## Deploying to Vercel

1. Push this repo to GitHub
2. Connect the GitHub repo to Vercel
3. Vercel auto-detects static HTML — no build step needed
4. Done! `vercel.json` handles clean URLs (e.g. `/about` instead of `/about.html`)

## Design Notes

- **Colors:** Gold (`#D4A017`), Brown (`#4A2C0A`), Green (`#3B7A2A`) — matching T2G brand
- **Fonts:** Playfair Display (headings) + Lato (body) + Dancing Script (accent)
- **Style:** Warm, organic, premium — inspired by Coco Natura Sugar's clean layout
- Fully responsive (mobile, tablet, desktop)
