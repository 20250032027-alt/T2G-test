# T2G Order Tracking Setup

This is a one-time setup. Takes about 15 minutes.

---

## Step 1: Create the Google Sheet

1. Go to https://sheets.google.com and create a new sheet
2. Name it: **T2G Order Tracking**
3. Set up the header row exactly like this (row 1):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| order_id | date | status | customer_name | items | total | tracking_number |

Column meanings:
- **order_id** — the T2G-XXXXX ID from the Formspree email
- **date** — when the order was placed (e.g. June 6, 2025)
- **status** — one of: `received` / `confirmed` / `packing` / `shipped` / `delivered`
- **customer_name** — customer's full name (for your reference only, not shown on tracking page)
- **items** — pipe-separated list e.g. `Coco Rush 500g x2 | Coco Vinegar x1`
- **total** — e.g. `PHP 595.00`
- **tracking_number** — courier tracking number (leave blank until shipped)

---

## Step 2: Publish the Sheet as CSV

1. In Google Sheets, go to **File > Share > Publish to web**
2. In the first dropdown, select **Sheet1**
3. In the second dropdown, select **Comma-separated values (.csv)**
4. Click **Publish** and confirm
5. Copy the URL it gives you — it looks like:
   `https://docs.google.com/spreadsheets/d/XXXXXXXXX/pub?gid=0&single=true&output=csv`

---

## Step 3: Paste the URL into track.html

Open `track.html` and find this line near the top of the `<script>` block:

```javascript
const SHEET_CSV_URL = ''; // paste your Google Sheet CSV URL here
```

Replace the empty string with your URL:

```javascript
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/XXXXXXXXX/pub?gid=0&single=true&output=csv';
```

Save the file and commit to GitHub. Vercel will redeploy automatically.

---

## Step 4: Daily workflow for T2G

When a new order email arrives from Formspree:
1. Open the Google Sheet
2. Add a new row with the order details from the email
3. Set status to `received`

As the order progresses, update the status column:
- `confirmed` — after verifying GCash proof
- `packing` — when you start preparing the items
- `shipped` — when handed to courier (add tracking number here)
- `delivered` — when confirmed delivered

The customer can check `trunktogold.com/track` at any time with their Order ID.

---

## Notes

- Changes to the sheet go live within a few minutes (Google caches the CSV)
- The tracking page also accepts a URL parameter: `track.html?id=T2G-XXXXX` — useful for linking directly in confirmation emails
- Customer names and internal notes in extra columns are ignored by the tracking page
- If you add more columns for internal use, keep them after column G so they don't break the parser
