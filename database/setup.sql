-- =============================================
-- MayorHub E-Commerce System — Full DB Setup
-- Run this on any new client's Supabase project
-- =============================================

-- 1. profiles table
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  full_name     text,
  email         text,
  phone         text,
  role          text default 'customer'
                check (role in ('super_admin','admin','staff','customer')),
  is_active     boolean default true,
  created_at    timestamptz default now(),
  referral_code text unique,
  referred_by   uuid references profiles(id)
);

-- 2. categories
create table categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

-- 3. products
create table products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique,
  description         text,
  price               numeric not null,
  stock               integer default 0,
  low_stock_threshold integer default 3,
  brand               text,
  cover_image         text,
  images              text[] default '{}',
  colors              text[] default '{}',
  category_id         uuid references categories(id),
  is_active           boolean default true,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  is_featured         boolean default false
);

-- 4. cart_items
create table cart_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade,
  product_id     uuid references products(id) on delete cascade,
  quantity       integer default 1,
  selected_color text,
  created_at     timestamptz default now(),
  unique(user_id, product_id, selected_color)
);

-- 5. promo_codes
create table promo_codes (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  discount_type  text check (discount_type in ('percentage','fixed')),
  discount_value numeric not null,
  min_order_amount numeric default 0,
  max_uses       integer,
  used_count     integer default 0,
  is_active      boolean default true,
  expires_at     timestamptz,
  created_at     timestamptz default now()
);

-- 6. orders
create table orders (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references profiles(id),
  customer_name    text,
  customer_email   text,
  customer_phone   text,
  type             text default 'online',
  status           text default 'pending'
                   check (status in ('pending','processing','shipped',
                                     'delivered','cancelled')),
  delivery_method  text,
  delivery_zone    text,
  delivery_fee     numeric default 0,
  address          text,
  subtotal         numeric,
  discount         numeric default 0,
  total            numeric,
  payment_method   text,
  payment_status   text default 'pending',
  payment_proof    text,
  promo_code       text,
  promo_applied    boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- 7. order_items
create table order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid references orders(id) on delete cascade,
  product_id     uuid references products(id),
  name           text,
  price          numeric,
  quantity       integer,
  subtotal       numeric,
  selected_color text,
  created_at     timestamptz default now()
);

-- 8. settings
create table settings (
  id                   text primary key default 'store',
  store_name           text default '',
  store_phone          text default '',
  super_admin_phone    text default '',
  store_email          text default '',
  store_address        text default '',
  store_description    text default '',
  logo_url             text default '',
  bank_name            text default '',
  account_number       text default '',
  account_name         text default '',
  delivery_fee_lagos   numeric default 0,
  delivery_fee_nigeria numeric default 0,
  delivery_fee_outside numeric default 0,
  updated_at           timestamptz default now()
);

insert into settings (id) values ('store') on conflict do nothing;

-- ── TRIGGERS ─────────────────────────────────

-- auto create profile on signup
create or replace function handle_new_user()
returns trigger as $$
declare
  v_referrer_id uuid;
  v_my_code text;
begin
  -- 1. Find referrer if code was provided in metadata
  if (new.raw_user_meta_data->>'referral_code') is not null then
    select id into v_referrer_id
    from public.profiles
    where referral_code = upper(new.raw_user_meta_data->>'referral_code');
  end if;

  -- 2. Generate unique code for the new user
  v_my_code := upper(
    substring(regexp_replace(new.raw_user_meta_data->>'full_name', '[^a-zA-Z]', '', 'g'), 1, 5)
    || floor(random() * 9000 + 1000)::text
  );

  -- 3. Create the profile
  insert into public.profiles (id, full_name, email, role, referral_code, referred_by)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'customer',
    v_my_code,
    v_referrer_id
  );

  -- 4. Create referral record if referred
  if v_referrer_id is not null then
    insert into public.referrals (referrer_id, referred_id, status)
    values (v_referrer_id, new.id, 'pending');
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- auto hide/show product based on stock
create or replace function handle_stock_change()
returns trigger as $$
begin
  if new.stock = 0 then
    new.is_active = false;
  end if;
  if new.stock > 0 and old.stock = 0 then
    new.is_active = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_stock_change
  before update on products
  for each row execute procedure handle_stock_change();

-- is_admin function
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('super_admin', 'admin')
  );
$$ language sql security definer stable;

-- ── RLS POLICIES ─────────────────────────────

alter table profiles    enable row level security;
alter table products    enable row level security;
alter table categories  enable row level security;
alter table cart_items  enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table promo_codes enable row level security;
alter table settings    enable row level security;

-- profiles
create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id or is_admin());

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Super admin can update any profile"
  on profiles for update
  using (auth.uid() in (
    select id from profiles where role = 'super_admin'
  ));

create policy "Super admin can delete any profile"
  on profiles for delete
  using (auth.uid() in (
    select id from profiles where role = 'super_admin'
  ));

-- products
create policy "Anyone can read active products"
  on products for select using (is_active = true or is_admin());

create policy "Admin can manage products"
  on products for all using (is_admin());

create policy "Customers can update product stock"
  on products for update using (true) with check (true);

-- categories
create policy "Anyone can read categories"
  on categories for select using (true);

create policy "Admin can manage categories"
  on categories for all using (is_admin());

-- cart_items
create policy "Users can manage own cart"
  on cart_items for all using (auth.uid() = user_id);

-- orders
create policy "Customers can insert orders"
  on orders for insert with check (auth.uid() = customer_id);

create policy "Admin can read all orders"
  on orders for select
  using (auth.uid() = customer_id or is_admin()
    or exists (
      select 1 from profiles
      where id = auth.uid() and role = 'staff'
    ));

create policy "Admin can update orders"
  on orders for update
  using (is_admin() or exists (
    select 1 from profiles
    where id = auth.uid() and role = 'staff'
  ));

create policy "Customers can update own order payment proof"
  on orders for update
  using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);

-- order_items
create policy "Customers can insert order items"
  on order_items for insert
  with check (order_id in (
    select id from orders where customer_id = auth.uid()
  ));

create policy "Admin can read all order items"
  on order_items for select
  using (
    order_id in (select id from orders where customer_id = auth.uid())
    or is_admin()
    or exists (select 1 from profiles where id = auth.uid() and role = 'staff')
  );

-- promo_codes
create policy "Customers can read active promo codes"
  on promo_codes for select using (is_active = true);

create policy "Admin can manage promo codes"
  on promo_codes for all using (is_admin());

-- settings
create policy "Anyone can read settings"
  on settings for select using (true);

create policy "Admin can update settings"
  on settings for update
  using (auth.uid() in (
    select id from profiles where role = 'super_admin'
  ));

-- ── STORAGE BUCKETS ──────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict do nothing;

-- storage policies
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Admin can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Customers can upload payment proof"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

create policy "Admin can view payment proofs"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and is_admin());

create policy "Customers can view own proofs"
  on storage.objects for select
  using (bucket_id = 'payment-proofs' and auth.role() = 'authenticated');

create policy "Admin can upload store assets"
  on storage.objects for insert
  with check (bucket_id = 'store-assets' and auth.role() = 'authenticated');

create policy "Public can view store assets"
  on storage.objects for select
  using (bucket_id = 'store-assets');




-----------------------------------------------------------
  -- New Adds
  -------------------------------------------------------

-- Add all missing configurable fields to settings
alter table settings
-- Appearance
add column if not exists primary_color        text default '#16A34A',
add column if not exists hero_badge_text      text default 'Now Live — Shop Online',
add column if not exists hero_cta_text        text default 'Shop Now',

-- Homepage Stats
add column if not exists stat_products        text default '100+',
add column if not exists stat_customers       text default '500+',
add column if not exists stat_deliveries      text default '1000+',

-- Why Choose Us (stored as JSON array)
add column if not exists why_choose_us        jsonb default '[
  {"icon":"✅","title":"Verified Products","desc":"All products are quality checked"},
  {"icon":"🚚","title":"Fast Delivery","desc":"Lagos same day, nationwide 2-3 days"},
  {"icon":"💳","title":"Secure Payment","desc":"Bank transfer with proof verification"},
  {"icon":"🔄","title":"24hr Support","desc":"WhatsApp support always available"}
]'::jsonb,

-- Categories (stored as JSON array)
add column if not exists store_categories     jsonb default '[
  {"name":"Phones","icon":"📱","desc":"Latest smartphones from top brands"},
  {"name":"Laptops","icon":"💻","desc":"Powerful laptops for work and play"},
  {"name":"Accessories","icon":"🎧","desc":"Gadgets, cables and accessories"}
]'::jsonb,

-- Business Rules
add column if not exists currency_symbol      text default '₦',
add column if not exists cart_expiry_days     integer default 3,
add column if not exists default_low_stock    integer default 3,

-- Contact & Social
add column if not exists whatsapp_number      text default '',
add column if not exists instagram_url        text default '',
add column if not exists twitter_url          text default '',
add column if not exists facebook_url         text default '',
add column if not exists business_hours       text default 'Mon - Sat: 9am - 6pm',

-- Checkout
add column if not exists payment_instructions text default 'Transfer the exact amount and upload your proof',
add column if not exists order_success_message text default 'Thank you for your order. We will contact you shortly.';




------------------------------------------------------------
-- SECURITY POLICIES CHANGED FOR SECURITY PURPOSE
------------------------------------------------------------
-- Drop the current open policy
drop policy if exists "Anyone can read settings" on settings;
-- Drop the old public view
drop view if exists public_settings cascade;
drop view if exists customer_settings cascade;

-- Recreate with two versions
-- Public view (for guests/anonymous) — no bank details
create view public_settings as
  select
    store_name, store_description, store_phone,
    store_email, store_address, business_hours,
    logo_url, primary_color, hero_badge_text, hero_cta_text,
    stat_products, stat_customers, stat_deliveries,
    why_choose_us, store_categories, currency_symbol,
    whatsapp_number, instagram_url, twitter_url,
    facebook_url, delivery_fee_lagos, delivery_fee_nigeria,
    delivery_fee_outside, cart_expiry_days,
    payment_instructions, order_success_message,
    flash_sales_enabled, scroll_offer_enabled, 
    scroll_offer_threshold, social_proof_enabled,
    referral_enabled, referral_reward_type, 
    referral_discount, referral_discount_type, welcome_discount
  from settings where id = 'store';

-- Customer view (for logged-in customers) — includes bank details
create view customer_settings as
  select
    store_name, store_description, store_phone,
    store_email, store_address, business_hours,
    logo_url, primary_color, hero_badge_text, hero_cta_text,
    stat_products, stat_customers, stat_deliveries,
    why_choose_us, store_categories, currency_symbol,
    whatsapp_number, instagram_url, twitter_url,
    facebook_url, delivery_fee_lagos, delivery_fee_nigeria,
    delivery_fee_outside, cart_expiry_days,
    payment_instructions, order_success_message,
    flash_sales_enabled, scroll_offer_enabled, 
    scroll_offer_threshold, social_proof_enabled,
    referral_enabled, referral_reward_type, 
    referral_discount, referral_discount_type, welcome_discount,
    -- ✅ Bank details included for paying customers
    bank_name, account_number, account_name
  from settings where id = 'store';

-- Grant access
grant select on public_settings   to anon, authenticated;
grant select on customer_settings  to authenticated;



-----------------------------------------------------------------
-- Product stock
-----------------------------------------------------------------
  -- Drop the dangerous broad policy
drop policy if exists "Customers can update product stock" on products;

-- Create a secure function that only updates stock
-- This runs with elevated privileges safely
create or replace function reduce_product_stock(
  p_product_id uuid,
  p_quantity    integer
)
returns void as $$
begin
  update products
  set stock = stock - p_quantity
  where id = p_product_id
    and stock >= p_quantity;
end;
$$ language plpgsql security definer;

-- Grant customers permission to call this function only
grant execute on function reduce_product_stock to authenticated;




------------------------------------------------------------------
-- Order Items
-----------------------------------------------------------------
-- Drop the current policy
drop policy if exists "Customers can insert order items" on order_items;

-- Secure version — validates the order belongs to the customer
create policy "Customers can insert own order items"
  on order_items for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = order_id
        and orders.customer_id = auth.uid()
    )
  );





  ---------------------------------------------------------------------
  -- Avatar Table
  -----------------------------------------------------------------------------
  alter table profiles
add column if not exists avatar_url text;

-- storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );

create policy "Public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
  );


  ------------------------------------------------
  -- Reviews & Promocodes
  ---------------------------------------------------
  -- Update promo_codes table with missing columns
alter table promo_codes
add column if not exists is_system_generated boolean default false,
add column if not exists generated_for       uuid references profiles(id),
add column if not exists description         text default '';

-- Update the discount_type check to include free_delivery
alter table promo_codes
drop constraint if exists promo_codes_discount_type_check;

alter table promo_codes
add constraint promo_codes_discount_type_check
check (discount_type in ('percentage', 'fixed', 'free_delivery'));

-- RLS
create policy "Admin can manage promo codes"
  on promo_codes for all
  using (is_admin())
  with check (is_admin());





-- ── PROMO CODE LOGIC ─────────────────────────

CREATE OR REPLACE FUNCTION handle_order_promo(p_order_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo_code TEXT;
    v_promo_applied BOOLEAN;
    v_payment_status TEXT;
    v_status TEXT;
BEGIN
    SELECT promo_code, promo_applied, payment_status, status
    INTO v_promo_code, v_promo_applied, v_payment_status, v_status
    FROM orders
    WHERE id = p_order_id;

    IF v_promo_code IS NULL THEN
        RETURN;
    END IF;

    -- Logic for incrementing: Must be PAID and in an active delivery state
    IF v_promo_applied = FALSE 
       AND v_payment_status = 'paid' 
       AND v_status IN ('processing', 'shipped', 'delivered') THEN
        
        UPDATE promo_codes
        SET used_count = coalesce(used_count, 0) + 1
        WHERE upper(code) = upper(v_promo_code);

        UPDATE orders
        SET promo_applied = TRUE
        WHERE id = p_order_id;

    -- Logic for decrementing: If it was already applied but now cancelled
    ELSIF v_promo_applied = TRUE AND v_status = 'cancelled' THEN
        
        UPDATE promo_codes
        SET used_count = GREATEST(0, coalesce(used_count, 0) - 1)
        WHERE upper(code) = upper(v_promo_code);

        UPDATE orders
        SET promo_applied = FALSE
        WHERE id = p_order_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION handle_order_promo(UUID) TO authenticated;




----------------------------------------------
-- Reviews
-----------------------------------------------
-- Reviews table
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete cascade,
  customer_id uuid references profiles(id) on delete cascade,
  order_id    uuid references orders(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  is_approved boolean default true,
  created_at  timestamptz default now(),
  -- one review per product per customer per order
  unique(product_id, customer_id, order_id)
);

-- RLS
alter table reviews enable row level security;

create policy "Anyone can read approved reviews"
  on reviews for select
  using (is_approved = true or is_admin());

create policy "Customers can insert own reviews"
  on reviews for insert
  with check (auth.uid() = customer_id);

create policy "Customers can update own reviews"
  on reviews for update
  using (auth.uid() = customer_id);

create policy "Admin can manage all reviews"
  on reviews for all
  using (is_admin());

-- Function to get average rating for a product
create or replace function get_product_rating(p_product_id uuid)
returns table(avg_rating numeric, review_count bigint) as $$
  select
    round(avg(rating)::numeric, 1) as avg_rating,
    count(*)                        as review_count
  from reviews
  where product_id = p_product_id
    and is_approved = true;
$$ language sql stable;

-- Add avg_rating and review_count to products view
-- We'll calculate this in the frontend for simplicity
-- Ensure unique constraint exists (prevents DB-level duplicates)
alter table reviews
drop constraint if exists reviews_product_id_customer_id_order_id_key;

alter table reviews
add constraint reviews_unique_per_order
unique (product_id, customer_id, order_id);

-- Allow admin to read all products (including inactive) for reviews join
drop policy if exists "Anyone can read active products" on products;

create policy "Anyone can read active products"
  on products for select
  using (is_active = true or is_admin());

-- Reviews RLS — make sure all policies exist
drop policy if exists "Anyone can read approved reviews"  on reviews;
drop policy if exists "Customers can insert own reviews"  on reviews;
drop policy if exists "Customers can update own reviews"  on reviews;
drop policy if exists "Admin can manage all reviews"      on reviews;

create policy "Anyone can read approved reviews"
  on reviews for select
  using (is_approved = true or is_admin());

create policy "Customers can insert own reviews"
  on reviews for insert
  with check (
    auth.uid() = customer_id
    and exists (
      select 1 from orders
      where orders.id        = order_id
        and orders.customer_id = auth.uid()
        and orders.status    = 'delivered'
    )
  );

create policy "Customers can update own reviews"
  on reviews for update
  using (auth.uid() = customer_id);

create policy "Admin can manage all reviews"
  on reviews for all
  using (is_admin())
  with check (is_admin());

-- ── PUBLIC VIEWS ─────────────────────────────
-- This view allows anyone to see reviewer names/avatars without 
-- exposing sensitive fields like email or phone numbers.
create or replace view public_profiles as
  select id, full_name, avatar_url
  from profiles;

grant select on public_profiles to anon, authenticated;


---------------------------------------------------
-- Flash Sales
---------------------------------------------------------
-- Flash sales table
create table flash_sales (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references products(id) on delete cascade,
  sale_price     numeric not null,
  label          text default 'FLASH SALE',
  starts_at      timestamptz not null default now(),
  ends_at        timestamptz not null,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

alter table flash_sales enable row level security;

create policy "Anyone can read active flash sales"
  on flash_sales for select
  using (is_active = true and ends_at > now());

create policy "Admin can manage flash sales"
  on flash_sales for all
  using (is_admin()) with check (is_admin());

-- Add engagement settings
alter table settings
add column if not exists social_proof_enabled    boolean default true,
add column if not exists scroll_offer_enabled    boolean default true,
add column if not exists scroll_offer_threshold  integer default 8,
add column if not exists flash_sales_enabled     boolean default true;



------------------------------------------------------
-- Referral
------------------------------------------------------
-- Add referral columns to profiles
alter table profiles
add column if not exists referral_code text unique,
add column if not exists referred_by   uuid references profiles(id);

-- Referrals tracking table
create table referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid references profiles(id) on delete cascade,
  referred_id     uuid references profiles(id) on delete cascade,
  status          text default 'pending'
                  check (status in ('pending','completed','rewarded')),
  reward_code     text,
  created_at      timestamptz default now(),
  unique(referred_id)
  -- one referral per referred customer
);

alter table referrals enable row level security;

create policy "Users can read own referrals"
  on referrals for select
  using (referrer_id = auth.uid() or referred_id = auth.uid());

create policy "System can insert referrals"
  on referrals for insert
  with check (auth.uid() = referred_id);

create policy "Admin can manage referrals"
  on referrals for all using (is_admin());

-- Add referral settings
alter table settings
add column if not exists referral_enabled      boolean default false,
add column if not exists referral_reward_type  text    default 'promo',
add column if not exists referral_discount     numeric default 10,
add column if not exists referral_discount_type text   default 'percentage',
add column if not exists welcome_discount      numeric default 0;

-- Generate referral codes for existing customers
-- Run this once to backfill
update profiles
set referral_code = upper(
  substring(regexp_replace(full_name, '[^a-zA-Z]', '', 'g'), 1, 5)
  || floor(random() * 9000 + 1000)::text
)
where referral_code is null
  and role = 'customer';