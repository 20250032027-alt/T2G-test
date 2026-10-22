# Setting up the order tracking sheet

> **Using Supabase?** Once `SUPABASE-SETUP.md` is done, the Track Order page reads orders straight from Supabase and you update them in the admin page. You don't need this sheet for new orders. Keep it only if you have older orders in it that customers may still look up.

The Track Order page reads a Google Sheet. You update the sheet, and customers see the new status within a minute or two.

One thing to understand before you start: the tracking page can only read the sheet if you publish it to the web, and once it's published, anyone who finds the link can download it. So this sheet should contain **only what the customer sees on the tracking page**. No names, phone numbers, emails or addresses. Those are already in the order emails Formspree sends you, which is where they should stay.

That's the whole idea. One small public sheet, nothing personal in it.

---

## 1. Create the sheet

1. Go to [sheets.new](https://sheets.new) while signed in to the T2G Google account.
2. Name it something like **T2G Order Tracking**.
3. Easiest way to set up the columns: in this project there's a file called `tracking-sheet-template.csv`. In Google Sheets, go to **File > Import > Upload**, choose that file, and pick **Replace current sheet**. Done.

   Or type these headers into row 1 yourself, exactly as written:

   | A | B | C | D | E | F |
   |---|---|---|---|---|---|
   | order_id | date | status | items | total | tracking_number |

   Capital letters and spaces are fine (`Order ID` works too), but the words must match.

## 2. Make the status column a dropdown

This stops typos like "shiped" from confusing the tracking page.

1. Click the name box at the top left of the sheet (left of the formula bar), type `C2:C1000` and press Enter.
2. **Data > Data validation > Add rule**.
3. Criteria: **Dropdown**. Add these five options:
   `received`, `confirmed`, `packing`, `shipped`, `delivered`
4. Click **Done**.

What each status shows the customer:

| Status | Shown as | When to use it |
|---|---|---|
| received | Order Received | Order came in, payment not checked yet |
| confirmed | Payment Confirmed | You've checked the GCash/BPI proof, or it's a cash pickup you've accepted |
| packing | Being Packed | You're preparing it |
| shipped | Out for Delivery | Handed to the courier, or ready for pickup |
| delivered | Delivered | Customer has it |

If someone types "paid", "packed", "in transit", "ready for pickup" or "completed", the page understands those too.

## 3. Publish it

1. **File > Share > Publish to web**.
2. First dropdown: choose the sheet tab (usually **Sheet1**). Do *not* leave it on "Entire document".
3. Second dropdown: choose **Comma-separated values (.csv)**.
4. Click **Publish**, confirm, and copy the link it gives you. It starts with `https://docs.google.com/spreadsheets/d/e/` and ends with `output=csv`.

## 4. Connect it to the website

1. Open `assets/site-config.js`.
2. Replace the link inside `TRACKING_SHEET_CSV_URL: '...'` with your new one. Keep the quote marks.
3. Save, commit and push. Vercel redeploys in about a minute.

## 5. Stop publishing the old sheet

Your previous tracking sheet had customer names in it, so turn it off:

1. Open the old sheet.
2. **File > Share > Publish to web**.
3. Expand **Published content and settings** and click **Stop publishing**.

## 6. Test it

Add a row like this, then go to your site's Track Order page and enter `T2G-TEST-0001`:

| order_id | date | status | items | total | tracking_number |
|---|---|---|---|---|---|
| T2G-TEST-0001 | Oct 14, 2026 | packing | CocoRush 500g x2 \| Adlai x1 | PHP 780.00 | |

You should see the order with "Being Packed" highlighted. Delete the row when you're done. Google can take up to 5 minutes to refresh the published copy, so if a change doesn't show right away, wait a little.

---

## Your routine when an order comes in

1. Formspree emails you the order. Copy the **order_id**, **items** and **total** from that email into a new row. The items already come separated by ` | `, which is the format the tracking page expects.
2. Set status to **received**.
3. Change the status as the order moves along.
4. When you ship, paste the courier's tracking number in **tracking_number**. It shows up on the customer's tracking page.

## Troubleshooting

- **"Order not found"**: check the order ID is in column A with no extra spaces, and that it's on the tab you published.
- **Changes don't appear**: Google's published copy refreshes every few minutes. Wait, then try again.
- **Nothing works at all**: open the CSV link from step 3 in your browser. If it downloads a file with your rows, the link is fine; check it's pasted correctly in `site-config.js`.
