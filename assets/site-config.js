/* ============================================================
   T2G site settings
   The few values you may need to change live here, so you
   don't have to dig through the HTML pages.
   ============================================================ */
window.T2G_CONFIG = {

  /* Order tracking (track.html), Google Sheet version.
     Once Supabase is set up, tracking reads orders from Supabase first and
     only checks this sheet for older orders. You can leave it as is. */
  TRACKING_SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR5yLYIkdJ0W1_so3YBW22BTz7DNGmiqSPBUEdxdqrcHQZSBWhbAdNB99Lhn9Eoho6bDciKJs2XId85/pub?gid=1723511987&single=true&output=csv',

  /* Supabase: orders, reviews, payment proofs and the admin page.
     From Supabase: Project Settings > API Keys (and Data API for the URL).
     Use the "publishable" key (sb_publishable_...) or the legacy "anon" key.
     Both are meant to be public: the rules in supabase/schema.sql only let
     visitors place orders, upload a proof into their own order, track an
     order by its code and submit reviews.
     NEVER put the secret / service_role key here.
     Leave empty and the site still works: orders are emailed (Formspree)
     and tracking uses the Google Sheet above. See SUPABASE-SETUP.md. */
  SUPABASE_URL:      '',   // e.g. https://xagccdkmigkpqpteclav.supabase.co,
  SUPABASE_ANON_KEY: '',   // e.g. sb_publishable_Q5Cd_r8b5adHDdQzPJXX6Q_iJQOpeuC,
  PROOF_BUCKET:      'payment-proofs',

  /* Send a Formspree email when a customer uploads a payment proof.
     Each email counts toward Formspree's free monthly limit. Set to false
     if you would rather check the admin page instead. */
  EMAIL_ON_PROOF: true,

  /* Send a Formspree email for each new order that was saved in Supabase.
     (If Supabase can't be reached, the email is always sent, because then
     it is the only record of the order.) */
  EMAIL_ON_ORDER: true,

  /* Contact details used in messages */
  CONTACT_EMAIL: 't2gcorp2017@yahoo.com',
  CONTACT_PHONE: '(0917) 716 4225',
  GCASH_NUMBER:  '09171178744',
};
