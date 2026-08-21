-- Cival Systems initial commerce schema
-- Safe base for a clean Supabase project. Apply 001 through 009 in order.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  category text not null,
  badge text,
  emoji text not null default '',
  features jsonb not null default '[]'::jsonb,
  image_url text,
  stripe_price_id text,
  download_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  customer_email text not null,
  customer_name text,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  download_token uuid unique default gen_random_uuid(),
  expires_at timestamptz not null,
  downloaded_count integer not null default 0 check (downloaded_count >= 0),
  max_downloads integer not null default 5 check (max_downloads > 0),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.downloads enable row level security;

-- Deliberately no policies here. Migration 005 adds the minimum public catalog
-- and authenticated owner-read policies after the account columns exist.

create index if not exists idx_orders_stripe_session on public.orders(stripe_session_id);
create index if not exists idx_orders_email on public.orders(customer_email);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_downloads_order on public.downloads(order_id);
