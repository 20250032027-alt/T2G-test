# Supabase setup: orders, admin page, reviews and payment proofs

This connects the website to Supabase so that:

- every order is saved in a database you can manage at **trunktogold.com/admin**
- customers can upload their GCash or BPI payment screenshot
- customers can leave product reviews, which you approve before they appear
- the Track Order page reads live order status

It takes about 20 minutes. Until it's done, the site keeps working the old way: orders are emailed to you through Formspree and tracking uses the Google Sheet.

---

## 1. Open your Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and open your project.

If you're creating a new one, choose the **Southeast Asia (Singapore)** region. It's the closest to the Philippines, so the site responds faster.

## 2. Create the database tables

1. In the left menu, click **SQL Editor**, then **New query**.
2. Open `supabase/schema.sql` from this project, copy everything, and paste it in.
3. Click **Run**. You should see "Success. No rows returned."

It's safe to run again later if the file is updated. It won't delete any orders or reviews.

If you already ran the payment-proof SQL from the earlier guide, that's fine. This file replaces it with a stricter version: uploads are now only accepted into the folder of a real order.

## 3. Connect the website

1. In Supabase, go to **Project Settings**.
2. Under **Data API** (or **API**), copy the **Project URL**. It looks like `https://abcdefghijkl.supabase.co`.
3. Under **API Keys**, copy the **Publishable** key (starts with `sb_publishable_`). If your project only shows legacy keys, copy the **anon / public** key (starts with `eyJ`) instead.
4. Open `assets/site-config.js` and paste them in:

   ```js
   SUPABASE_URL:      'https://abcdefghijkl.supabase.co',
   SUPABASE_ANON_KEY: 'sb_publishable_...',
   ```

> **Never** paste the **secret** or **service_role** key anywhere in the website. That key can read and delete everything.
> The publishable key is meant to be public. The rules in `schema.sql` only let visitors place an order, upload a proof into their own order, look up an order by its code, and submit a review.

## 4. Create your admin login

1. In Supabase, go to **Authentication > Users**.
2. Click **Add user > Create new user**. Enter your email and a strong password, and tick **Auto Confirm User**.
3. Go back to **SQL Editor > New query**, paste this with your email in it, and click **Run**:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```

To give someone else access later, create a user for them the same way and run the same SQL with their email. To remove someone:

```sql
delete from public.admins where email = 'them@example.com';
```

## 5. Lock down sign-ups and password resets

1. **Authentication > Sign In / Providers** (on some dashboards, **Authentication > Settings**): turn **off** "Allow new users to sign up". Only you should create accounts. Without this, anyone could make an account; they still couldn't see orders, but there's no reason to allow it.
2. **Authentication > URL Configuration**:
   - **Site URL**: `https://www.trunktogold.com`
   - **Redirect URLs**: add `https://www.trunktogold.com/admin`

   This makes the "Forgot your password?" link on the admin page work.

## 6. Publish and test

Commit and push. Vercel redeploys in about a minute. Then check each part:

- [ ] Place a test order with **GCash** and **Pickup**. The Order ID should look like `T2G-261022-K7QM9`.
- [ ] On the "Order placed" screen, upload any screenshot. It should say "T2G received your proof."
- [ ] Open **trunktogold.com/admin** and sign in. The test order should be there with the screenshot.
- [ ] Press **Payment is OK, confirm**. Then open **Track Order** with the Order ID: it should show "Payment Confirmed".
- [ ] On any product page, write a test review. It appears in the admin **Reviews** tab; approve it and it shows on the product page.
- [ ] Open the **Usage** tab and check that the numbers load.
- [ ] Clean up: in admin, set the test order to **Cancelled** and delete the test review.

## 7. Keep the free project awake

Free Supabase projects **pause after 7 days without activity**. If that happens, checkout still works (orders are emailed to you), but the admin page and tracking stop until you press **Restore** in the Supabase dashboard.

A small GitHub job in this project (`.github/workflows/supabase-keepalive.yml`) prevents this by pinging the database once a day. To switch it on:

1. On GitHub, open the repository, then **Settings > Secrets and variables > Actions**.
2. Click **New repository secret** and add:
   - Name `SUPABASE_URL`, value: your project URL
   - Name `SUPABASE_ANON_KEY`, value: the same publishable key as in `site-config.js`
3. Go to the **Actions** tab, pick **Keep Supabase awake**, and click **Run workflow** once to test it. A green tick means it works.

GitHub turns off scheduled jobs in public repositories that have had no activity for 60 days. If that happens it emails you, and you can switch it back on from the Actions tab.

---

## Using the admin page

**Orders.** The headline tells you what needs doing. Click an order to open it. The green button moves it to the next step:

| Status | What it means | Customer sees |
|---|---|---|
| Received | New order | Order Received |
| Confirmed | You've checked the payment (or accepted a cash pickup) | Payment Confirmed |
| Packing | You're preparing it | Being Packed |
| Shipped / Ready for pickup | With the courier, or waiting at the pickup point | Out for Delivery / Ready for Pickup |
| Delivered / Collected | Done | Delivered / Collected |
| Cancelled | Cancelled | Cancelled |

When you ship, choose the courier and type the tracking number before saving; the customer sees both on the tracking page. **Email update** and **Text update** open a ready-written message to the customer.

If a customer chose delivery but the shipping fee couldn't be worked out at checkout, the order shows "+ shipping". Type the fee into the order and save, and the total updates.

**Reviews.** New reviews wait in the **Reviews** tab. **Approve** puts them on the website, **Hide** keeps them off. You can add a public reply, which appears under the review.

**Usage.** Shows how much of the free plan you're using:

| | Free plan limit | What uses it |
|---|---|---|
| Database | 500 MB | Orders and reviews. Each order is about 2 KB. |
| File storage | 1 GB | Payment screenshots, about 150 to 400 KB each |
| Bandwidth | 5 GB a month | Opening screenshots in admin, website requests. Check in the Supabase dashboard under your organization's **Usage** page. |
| Formspree emails | 50 a month | Order emails, proof emails, contact and export forms, all together |

Once a month, use **Payment proof clean-up** on the Usage tab. It deletes screenshots from orders completed more than 90 days ago, which is what the Privacy Policy promises.

**Saving Formspree emails.** Now that the admin page shows every order, you may not need an email for each one. In `assets/site-config.js`:

- `EMAIL_ON_ORDER: false` stops the email for orders saved in Supabase. Orders that couldn't be saved are always emailed, because then the email is the only record.
- `EMAIL_ON_PROOF: false` stops the "payment proof received" email.

---

## Troubleshooting

- **Admin says "This account isn't an admin."** Step 4 wasn't run for that email, or the email has a typo. Run the SQL again.
- **Admin says "Admin isn't connected yet."** `site-config.js` is missing the URL or key, or the change hasn't been pushed.
- **Customers see "Upload failed."** Check `schema.sql` ran without errors. In **Storage > Policies**, `storage.objects` should have "Customers can upload payment proofs".
- **Orders arrive by email marked "NO - database unavailable."** Supabase was paused or unreachable. Open the dashboard and press **Restore** if it's paused, then set up step 7.
- **Password reset link doesn't work.** Check step 5, part 2. Open the link on the same device where you requested it.
