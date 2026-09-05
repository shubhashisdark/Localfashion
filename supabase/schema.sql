-- =============================================================================
-- LOCAL FASHION — Supabase schema (Phase 2)
-- Run this in the Supabase SQL editor on a fresh project.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ADMIN USERS
-- Admins are Supabase Auth users. This table just marks *which* auth users
-- are allowed into the admin panel — it holds no passwords.
-- ---------------------------------------------------------------------------
create table admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  status text not null default 'active' check (status in ('active', 'hidden', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- Status is draft/published/archived only. "Sold out" is derived from stock,
-- never stored — see the `product_is_sold_out` view below.
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10, 2) not null check (price > 0),
  sale_price numeric(10, 2) check (sale_price is null or sale_price > 0),
  category_id uuid not null references categories (id) on delete restrict,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_price_lower check (sale_price is null or sale_price < price)
);

create index products_category_id_idx on products (category_id);
create index products_status_idx on products (status);

-- ---------------------------------------------------------------------------
-- PRODUCT VARIANTS (size + stock)
-- ---------------------------------------------------------------------------
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create index product_variants_product_id_idx on product_variants (product_id);

-- ---------------------------------------------------------------------------
-- PRODUCT IMAGES (Supabase Storage holds the binary; this table holds the URL)
-- ---------------------------------------------------------------------------
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,
  storage_path text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on product_images (product_id);

-- Only one primary image per product.
create unique index product_images_one_primary_per_product
  on product_images (product_id)
  where is_primary;

-- ---------------------------------------------------------------------------
-- PROMOTIONS (homepage hero / banners)
-- ---------------------------------------------------------------------------
create table promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  discount_text text,
  image_url text not null,
  button_text text not null default 'Shop now',
  target_url text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HOMEPAGE SECTIONS (lightweight, not a full page builder)
-- ---------------------------------------------------------------------------
create table homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_type text not null,
  title text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  configuration jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- STORE SETTINGS (single row)
-- ---------------------------------------------------------------------------
create table store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Local Fashion',
  logo_url text,
  whatsapp_number text not null,
  phone text,
  email text,
  instagram_url text,
  address text,
  city text,
  state text,
  pincode text,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

insert into store_settings (id, whatsapp_number) values (true, '910000000000');

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER ITEMS
-- Product name / price are snapshotted onto order_items so later edits to a
-- product never rewrite order history.
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  subtotal numeric(10, 2) not null,
  total_amount numeric(10, 2) not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled', 'fulfilled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_provider text not null default 'none' check (payment_provider in ('none', 'razorpay')),
  payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  size text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- Derived "sold out" view — never stored, always computed from stock.
-- ---------------------------------------------------------------------------
create or replace view product_availability as
select
  p.id as product_id,
  coalesce(sum(v.stock), 0) as total_stock,
  coalesce(sum(v.stock), 0) = 0 as is_sold_out
from products p
left join product_variants v on v.product_id = p.id
group by p.id;

-- =============================================================================
-- ROW LEVEL SECURITY
-- Public (anon) role: read-only on published/active catalogue data, and
-- insert-only on orders/order_items (customers place orders, never read
-- other people's orders back). Everything else requires an authenticated
-- admin_users row.
-- =============================================================================

alter table admin_users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table promotions enable row level security;
alter table homepage_sections enable row level security;
alter table store_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$;

-- admin_users: admins can read the list; nobody but the service role writes it.
create policy "Admins can view admin_users" on admin_users
  for select using (is_admin());

-- categories: public reads active ones; admins do everything.
create policy "Public can view active categories" on categories
  for select using (status = 'active' or is_admin());
create policy "Admins manage categories" on categories
  for insert with check (is_admin());
create policy "Admins update categories" on categories
  for update using (is_admin());
create policy "Admins delete categories" on categories
  for delete using (is_admin());

-- products: public reads published; admins do everything.
create policy "Public can view published products" on products
  for select using (status = 'published' or is_admin());
create policy "Admins insert products" on products
  for insert with check (is_admin());
create policy "Admins update products" on products
  for update using (is_admin());
create policy "Admins delete products" on products
  for delete using (is_admin());

-- product_variants: public can read stock for published products only.
create policy "Public can view variants of published products" on product_variants
  for select using (
    is_admin() or exists (
      select 1 from products p where p.id = product_id and p.status = 'published'
    )
  );
create policy "Admins manage variants" on product_variants
  for all using (is_admin()) with check (is_admin());

-- product_images: same pattern as variants.
create policy "Public can view images of published products" on product_images
  for select using (
    is_admin() or exists (
      select 1 from products p where p.id = product_id and p.status = 'published'
    )
  );
create policy "Admins manage images" on product_images
  for all using (is_admin()) with check (is_admin());

-- promotions: public reads active ones only.
create policy "Public can view active promotions" on promotions
  for select using (is_active or is_admin());
create policy "Admins manage promotions" on promotions
  for all using (is_admin()) with check (is_admin());

-- homepage_sections: public reads active ones only.
create policy "Public can view active homepage sections" on homepage_sections
  for select using (is_active or is_admin());
create policy "Admins manage homepage sections" on homepage_sections
  for all using (is_admin()) with check (is_admin());

-- store_settings: public can read (needed for WhatsApp number, Instagram
-- link, etc. on the storefront); only admins can update.
create policy "Public can view store settings" on store_settings
  for select using (true);
create policy "Admins update store settings" on store_settings
  for update using (is_admin());

-- orders: customers can create an order but never read any order back
-- (guest checkout, no accounts). Admins can read/update everything.
create policy "Anyone can place an order" on orders
  for insert with check (true);
create policy "Admins view orders" on orders
  for select using (is_admin());
create policy "Admins update orders" on orders
  for update using (is_admin());

create policy "Anyone can create order items for their own order" on order_items
  for insert with check (
    exists (select 1 from orders o where o.id = order_id)
  );
create policy "Admins view order items" on order_items
  for select using (is_admin());

-- =============================================================================
-- STORAGE
-- Create a public bucket named "product-images" in the Supabase dashboard
-- (Storage → New bucket → Public bucket: on), then apply these policies.
-- =============================================================================

-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;
--
-- create policy "Public can view product images"
--   on storage.objects for select
--   using (bucket_id = 'product-images');
--
-- create policy "Admins can upload product images"
--   on storage.objects for insert
--   with check (bucket_id = 'product-images' and is_admin());
--
-- create policy "Admins can delete product images"
--   on storage.objects for delete
--   using (bucket_id = 'product-images' and is_admin());
