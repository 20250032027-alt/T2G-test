-- ============================================================
--  T2G Trunk to Gold - Supabase setup
--  Paste this whole file into Supabase > SQL Editor > New query > Run.
--  Safe to run again: it updates what is already there.
--
--  What it creates
--    orders   - every website order (customer details are private)
--    reviews  - product reviews; only approved ones are shown
--    admins   - which logins may use admin.html
--    payment-proofs storage bucket (private)
--    functions the website calls (place_order, track_order, ...)
--
--  Security model
--    Website visitors never read or write the tables directly.
--    They can only call the public functions below, which check
--    their input and return just what a customer should see.
--    Logged-in admins (listed in public.admins) can read and edit everything.
-- ============================================================

-- ------------------------------------------------------------
--  Admins
-- ------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "Admins can see the admin list" on public.admins;
create policy "Admins can see the admin list" on public.admins
  for select to authenticated using (public.is_admin());

-- ------------------------------------------------------------
--  Orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_code       text not null unique,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  status           text not null default 'received'
                   check (status in ('received','confirmed','packing','shipped','delivered','cancelled')),
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  phone            text not null,
  delivery_method  text not null check (delivery_method in ('pickup','ship')),
  pickup_location  text check (pickup_location in ('jasaan','cdo')),
  address          jsonb,
  payment_method   text not null check (payment_method in ('gcash','bpi','cash')),
  items            jsonb not null,
  subtotal         numeric(12,2) not null,
  shipping_fee     numeric(12,2),
  shipping_known   boolean not null default true,
  total            numeric(12,2) not null,
  customer_note    text,
  tracking_number  text,
  courier          text,
  admin_notes      text,
  proof_paths      text[] not null default '{}',
  proof_uploaded_at timestamptz,
  proofs_deleted_at timestamptz,
  status_history   jsonb not null default '[]'::jsonb,
  source           text not null default 'website'
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);
create index if not exists orders_email_idx      on public.orders (lower(email));
alter table public.orders enable row level security;

drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Keep updated_at and a status history automatically
create or replace function public.orders_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    new.status_history := coalesce(old.status_history, '[]'::jsonb)
      || jsonb_build_object('status', new.status, 'at', now());
  end if;
  return new;
end;
$$;
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.orders_touch();

-- ------------------------------------------------------------
--  Reviews
-- ------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  product_id  text not null,
  name        text not null,
  email       text,
  rating      int  not null check (rating between 1 and 5),
  body        text not null,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  reply       text,
  approved_at timestamptz,
  verified    boolean not null default false
);
create index if not exists reviews_product_idx on public.reviews (product_id, status, created_at desc);
alter table public.reviews enable row level security;

drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Admins manage reviews" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
--  Public functions (called by the website, no login)
-- ------------------------------------------------------------

-- Keep-alive check used by the GitHub workflow. Free projects pause after
-- a week without activity; a daily call keeps the database awake.
create or replace function public.ping()
returns text language sql stable as $$ select 'ok'::text $$;

-- Does an order code exist? (used by the storage upload rule)
create or replace function public.order_code_exists(p_code text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.orders where order_code = upper(p_code) and status <> 'cancelled');
$$;

-- Place an order. Returns the new order code, e.g. T2G-261022-K7QM9.
create or replace function public.place_order(p jsonb)
returns text
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_items     jsonb := p -> 'items';
  v_item      jsonb;
  v_clean     jsonb := '[]'::jsonb;
  v_subtotal  numeric(12,2) := 0;
  v_qty       int;
  v_price     numeric(12,2);
  v_ship      numeric(12,2);
  v_known     boolean := coalesce((p ->> 'shipping_known')::boolean, true);
  v_delivery  text := p ->> 'delivery_method';
  v_email     text := lower(trim(p ->> 'email'));
  v_code      text;
  v_alphabet  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_tries     int := 0;
  v_rand      bytea;
begin
  -- Basic checks
  if coalesce(length(trim(p ->> 'first_name')), 0) not between 1 and 80
     or coalesce(length(trim(p ->> 'last_name')), 0) not between 1 and 80 then
    raise exception 'Please enter your first and last name.';
  end if;
  if v_email is null or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(v_email) > 160 then
    raise exception 'Please enter a valid email address.';
  end if;
  if length(regexp_replace(coalesce(p ->> 'phone', ''), '\D', '', 'g')) not between 10 and 13 then
    raise exception 'Please enter a valid mobile number.';
  end if;
  if v_delivery not in ('pickup', 'ship') then
    raise exception 'Please choose pickup or shipping.';
  end if;
  if (p ->> 'payment_method') not in ('gcash', 'bpi', 'cash') then
    raise exception 'Please choose a payment method.';
  end if;
  if v_delivery = 'ship' and coalesce(length(trim(p -> 'address' ->> 'street')), 0) < 3 then
    raise exception 'Please enter your delivery address.';
  end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) not between 1 and 60 then
    raise exception 'Your cart is empty.';
  end if;

  -- Simple flood protection: at most 8 orders per email per hour
  if (select count(*) from public.orders
      where lower(email) = v_email and created_at > now() - interval '1 hour') >= 8 then
    raise exception 'Too many orders from this email in the last hour. Please contact T2G directly.';
  end if;

  -- Clean the items and recompute the subtotal here, not in the browser
  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty   := (v_item ->> 'qty')::int;
    v_price := (v_item ->> 'unit_price')::numeric;
    if v_qty is null or v_qty not between 1 and 999 or v_price is null or v_price < 0 or v_price > 100000 then
      raise exception 'One of the items in your cart is not valid.';
    end if;
    v_clean := v_clean || jsonb_build_object(
      'product_id', left(v_item ->> 'product_id', 60),
      'name',       left(v_item ->> 'name', 120),
      'variant',    left(nullif(v_item ->> 'variant', ''), 80),
      'qty',        v_qty,
      'unit_price', v_price,
      'line_total', round(v_price * v_qty, 2)
    );
    v_subtotal := v_subtotal + round(v_price * v_qty, 2);
  end loop;

  if v_delivery = 'ship' and v_known then
    v_ship := greatest(coalesce((p ->> 'shipping_fee')::numeric, 0), 0);
  else
    v_ship := case when v_delivery = 'pickup' then 0 else null end;
  end if;

  -- Readable, hard-to-guess order code: T2G-YYMMDD-XXXXX
  loop
    v_code := 'T2G-' || to_char(now() at time zone 'Asia/Manila', 'YYMMDD') || '-';
    v_rand := uuid_send(gen_random_uuid());           -- 16 random bytes
    for i in 0..4 loop
      v_code := v_code || substr(v_alphabet, 1 + (get_byte(v_rand, i) % 32), 1);  -- 32-letter alphabet, no 0/O/1/I
    end loop;
    exit when not exists (select 1 from public.orders where order_code = v_code);
    v_tries := v_tries + 1;
    if v_tries > 20 then raise exception 'Could not create an order number. Please try again.'; end if;
  end loop;

  insert into public.orders (
    order_code, first_name, last_name, email, phone,
    delivery_method, pickup_location, address, payment_method,
    items, subtotal, shipping_fee, shipping_known, total, customer_note, status_history
  ) values (
    v_code,
    left(trim(p ->> 'first_name'), 80),
    left(trim(p ->> 'last_name'), 80),
    v_email,
    left(trim(p ->> 'phone'), 30),
    v_delivery,
    case when v_delivery = 'pickup' then coalesce(nullif(p ->> 'pickup_location', ''), 'jasaan') end,
    case when v_delivery = 'ship' then jsonb_build_object(
      'street', left(p -> 'address' ->> 'street', 200),
      'apt',    left(p -> 'address' ->> 'apt', 120),
      'city',   left(p -> 'address' ->> 'city', 120),
      'region', left(p -> 'address' ->> 'region', 120),
      'zip',    left(p -> 'address' ->> 'zip', 12)) end,
    p ->> 'payment_method',
    v_clean,
    v_subtotal,
    v_ship,
    case when v_delivery = 'ship' then v_known else true end,
    v_subtotal + coalesce(v_ship, 0),
    left(nullif(trim(p ->> 'note'), ''), 1000),
    jsonb_build_array(jsonb_build_object('status', 'received', 'at', now()))
  );

  return v_code;
end;
$$;

-- What a customer sees on the tracking page. No names, phones or addresses.
create or replace function public.track_order(p_code text)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'order_code',      o.order_code,
    'created_at',      o.created_at,
    'updated_at',      o.updated_at,
    'status',          o.status,
    'delivery_method', o.delivery_method,
    'pickup_location', o.pickup_location,
    'payment_method',  o.payment_method,
    'items',           (select coalesce(jsonb_agg(jsonb_build_object(
                          'name', i ->> 'name', 'variant', i ->> 'variant', 'qty', (i ->> 'qty')::int)), '[]'::jsonb)
                        from jsonb_array_elements(o.items) i),
    'total',           o.total,
    'shipping_known',  o.shipping_known,
    'tracking_number', o.tracking_number,
    'courier',         o.courier,
    'proof_received',  coalesce(array_length(o.proof_paths, 1), 0) > 0,
    'history',         o.status_history
  )
  from public.orders o
  where o.order_code = upper(trim(p_code));
$$;

-- Record a payment proof that the browser has just uploaded to storage.
create or replace function public.attach_proof(p_code text, p_path text)
returns boolean
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_code text := upper(trim(p_code));
begin
  if p_path is null or split_part(p_path, '/', 1) <> v_code or p_path like '%..%' then
    raise exception 'Invalid file path.';
  end if;
  update public.orders
     set proof_paths = array_append(proof_paths, p_path),
         proof_uploaded_at = now()
   where order_code = v_code
     and status <> 'cancelled'
     and coalesce(array_length(proof_paths, 1), 0) < 5
     and not (p_path = any (proof_paths));
  return found;
end;
$$;

-- Approved reviews for one product (no emails).
create or replace function public.get_reviews(p_product_id text)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', r.id, 'name', r.name, 'rating', r.rating, 'body', r.body,
           'reply', r.reply, 'verified', r.verified, 'created_at', r.created_at)
         order by r.created_at desc), '[]'::jsonb)
  from public.reviews r
  where r.product_id = p_product_id and r.status = 'approved';
$$;

-- Average rating and count for every product (for product cards).
create or replace function public.review_summary()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(product_id, jsonb_build_object('avg', avg_rating, 'count', n)), '{}'::jsonb)
  from (
    select product_id, round(avg(rating)::numeric, 1) as avg_rating, count(*) as n
    from public.reviews where status = 'approved' group by product_id
  ) s;
$$;

-- Submit a review. It waits for approval in admin.html before it shows.
create or replace function public.submit_review(
  p_product_id text, p_name text, p_email text, p_rating int, p_body text)
returns boolean
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if coalesce(length(trim(p_product_id)), 0) not between 1 and 60 then raise exception 'Unknown product.'; end if;
  if coalesce(length(trim(p_name)), 0) not between 1 and 60 then raise exception 'Please enter your name.'; end if;
  if v_email is null or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then raise exception 'Please enter a valid email.'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'Please choose a star rating.'; end if;
  if coalesce(length(trim(p_body)), 0) not between 3 and 2000 then raise exception 'Please write a short review (up to 2,000 characters).'; end if;

  if exists (select 1 from public.reviews
             where lower(email) = v_email and product_id = p_product_id
               and created_at > now() - interval '1 day') then
    raise exception 'You have already reviewed this product today. Thank you!';
  end if;
  if (select count(*) from public.reviews where status = 'pending' and created_at > now() - interval '1 hour') > 30 then
    raise exception 'We are receiving a lot of reviews right now. Please try again later.';
  end if;

  insert into public.reviews (product_id, name, email, rating, body, verified)
  values (
    trim(p_product_id), left(trim(p_name), 60), v_email, p_rating, left(trim(p_body), 2000),
    -- "Verified buyer" if this email has a confirmed order containing the product
    exists (select 1 from public.orders o
            where lower(o.email) = v_email
              and o.status in ('confirmed','packing','shipped','delivered')
              and exists (select 1 from jsonb_array_elements(o.items) i where i ->> 'product_id' = trim(p_product_id)))
  );
  return true;
end;
$$;

-- ------------------------------------------------------------
--  Admin-only functions
-- ------------------------------------------------------------

-- Usage numbers for the admin dashboard
create or replace function public.admin_usage()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  select jsonb_build_object(
    'db_bytes',            pg_database_size(current_database()),
    'storage_bytes',       (select coalesce(sum((metadata ->> 'size')::bigint), 0) from storage.objects),
    'storage_files',       (select count(*) from storage.objects),
    'proof_bytes',         (select coalesce(sum((metadata ->> 'size')::bigint), 0) from storage.objects where bucket_id = 'payment-proofs'),
    'proof_files',         (select count(*) from storage.objects where bucket_id = 'payment-proofs'),
    'orders_total',        (select count(*) from public.orders),
    'orders_30d',          (select count(*) from public.orders where created_at > now() - interval '30 days'),
    'sales_30d',           (select coalesce(sum(total), 0) from public.orders where created_at > now() - interval '30 days' and status <> 'cancelled'),
    'reviews_pending',     (select count(*) from public.reviews where status = 'pending'),
    'reviews_total',       (select count(*) from public.reviews),
    'last_order_at',       (select max(created_at) from public.orders),
    'orders_this_month',   (select count(*) from public.orders
                             where created_at >= date_trunc('month', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'),
    'proofs_this_month',   (select count(*) from public.orders
                             where proof_uploaded_at >= date_trunc('month', now() at time zone 'Asia/Manila') at time zone 'Asia/Manila'),
    'old_proof_orders',    (select count(*) from public.orders
                             where coalesce(array_length(proof_paths, 1), 0) > 0
                               and status in ('delivered','cancelled')
                               and updated_at < now() - interval '90 days'),
    'checked_at',          now()
  ) into v;
  return v;
end;
$$;

-- ------------------------------------------------------------
--  Payment proof storage
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Visitors may add a file only inside the folder of a real order (T2G-.../file.jpg).
drop policy if exists "Customers can upload payment proofs" on storage.objects;
create policy "Customers can upload payment proofs" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'payment-proofs'
    and public.order_code_exists((storage.foldername(name))[1])
  );

drop policy if exists "Admins can view payment proofs" on storage.objects;
create policy "Admins can view payment proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

drop policy if exists "Admins can delete payment proofs" on storage.objects;
create policy "Admins can delete payment proofs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

-- ------------------------------------------------------------
--  Who may call what
-- ------------------------------------------------------------
revoke execute on function public.place_order(jsonb)                      from public;
revoke execute on function public.track_order(text)                       from public;
revoke execute on function public.attach_proof(text, text)                from public;
revoke execute on function public.get_reviews(text)                       from public;
revoke execute on function public.review_summary()                        from public;
revoke execute on function public.submit_review(text, text, text, int, text) from public;
revoke execute on function public.order_code_exists(text)                 from public;
revoke execute on function public.ping()                                  from public;
revoke execute on function public.admin_usage()                           from public;
revoke execute on function public.is_admin()                              from public;

grant execute on function public.place_order(jsonb)                       to anon, authenticated;
grant execute on function public.track_order(text)                        to anon, authenticated;
grant execute on function public.attach_proof(text, text)                 to anon, authenticated;
grant execute on function public.get_reviews(text)                        to anon, authenticated;
grant execute on function public.review_summary()                         to anon, authenticated;
grant execute on function public.submit_review(text, text, text, int, text) to anon, authenticated;
grant execute on function public.order_code_exists(text)                  to anon, authenticated;
grant execute on function public.ping()                                   to anon, authenticated;
grant execute on function public.admin_usage()                            to authenticated;
grant execute on function public.is_admin()                               to anon, authenticated;

-- Visitors get no direct table access at all.
revoke all on public.orders, public.reviews, public.admins from anon;
grant select, insert, update, delete on public.orders, public.reviews to authenticated;
grant select on public.admins to authenticated;
