-- ============================================
-- COURSE MARKETPLACE - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. CREATOR PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  razorpay_account_id text,
  payout_email text,
  is_onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Username format check (lowercase, alphanumeric, hyphens, 3-30 chars)
alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9-]{3,30}$');

-- ============================================
-- 2. PRODUCTS (courses / digital products)
-- ============================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  slug text not null,
  title text not null,
  description text,
  price_inr integer not null check (price_inr >= 0), -- stored in paise (smallest unit)
  thumbnail_url text,
  file_path text, -- path in supabase storage bucket "product-files"
  file_name text,
  file_size_bytes bigint,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(creator_id, slug)
);

alter table public.products enable row level security;

create policy "Published products are viewable by everyone"
  on public.products for select
  using (status = 'published' or auth.uid() = creator_id);

create policy "Creators can insert their own products"
  on public.products for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update their own products"
  on public.products for update
  using (auth.uid() = creator_id);

create policy "Creators can delete their own products"
  on public.products for delete
  using (auth.uid() = creator_id);

create index products_creator_id_idx on public.products(creator_id);
create index products_status_idx on public.products(status);

-- ============================================
-- 3. ORDERS (purchases)
-- ============================================
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete restrict not null,
  creator_id uuid references public.profiles(id) on delete restrict not null,
  buyer_email text not null,
  buyer_name text,
  amount_inr integer not null, -- total amount paid, in paise
  platform_fee_inr integer not null, -- platform commission, in paise
  creator_earning_inr integer not null, -- creator's cut, in paise
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  razorpay_signature text,
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  download_token uuid default uuid_generate_v4(), -- used for secure download link
  download_count integer default 0,
  created_at timestamptz default now(),
  paid_at timestamptz
);

alter table public.orders enable row level security;

-- Buyers don't have accounts, so orders are only readable by the creator (via service role for checkout/webhook)
create policy "Creators can view their own orders"
  on public.orders for select
  using (auth.uid() = creator_id);

-- Inserts/updates happen via server-side (service role key), not directly from client
create index orders_creator_id_idx on public.orders(creator_id);
create index orders_product_id_idx on public.orders(product_id);
create index orders_razorpay_order_id_idx on public.orders(razorpay_order_id);
create index orders_download_token_idx on public.orders(download_token);

-- ============================================
-- 4. STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public)
values ('product-files', 'product-files', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('thumbnails', 'thumbnails', true)
on conflict (id) do nothing;

-- Storage policies: creators can upload/manage their own files
create policy "Creators can upload their own product files"
  on storage.objects for insert
  with check (
    bucket_id = 'product-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Creators can update their own product files"
  on storage.objects for update
  using (
    bucket_id = 'product-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Creators can delete their own product files"
  on storage.objects for delete
  using (
    bucket_id = 'product-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Thumbnails are public
create policy "Anyone can view thumbnails"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "Creators can upload thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'thumbnails'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Creators can update their thumbnails"
  on storage.objects for update
  using (
    bucket_id = 'thumbnails'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 5. TRIGGER: auto-update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.handle_updated_at();
