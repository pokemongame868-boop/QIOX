-- =============================================
-- QIOX Store — Supabase SQL Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── CATEGORIES ──────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  description text,
  image       text,
  created_at  timestamptz default now()
);

-- ── PRODUCTS ────────────────────────────────
create table products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text not null unique,
  description  text,
  price        numeric(12,2) not null,
  old_price    numeric(12,2),
  images       text[] default '{}',
  category_id  uuid references categories(id) on delete set null,
  brand        text,
  rating       numeric(3,2) default 0,
  review_count integer default 0,
  in_stock     boolean default true,
  is_new       boolean default false,
  is_featured  boolean default false,
  specs        jsonb default '{}',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── PROFILES (extends auth.users) ────────────
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  phone      text,
  created_at timestamptz default now()
);

-- ── CART ────────────────────────────────────
create table cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ── WISHLIST ─────────────────────────────────
create table wishlist_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ── ORDERS ───────────────────────────────────
create table orders (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references profiles(id) on delete set null,
  status       text default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total_price  numeric(12,2) not null,
  address      jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table order_items (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity   integer not null,
  price      numeric(12,2) not null
);

-- ── REVIEWS ──────────────────────────────────
create table reviews (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now(),
  unique(product_id, user_id)
);

-- ── RLS POLICIES ────────────────────────────
alter table products enable row level security;
alter table categories enable row level security;
alter table profiles enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;

-- Public can read products and categories
create policy "Public can view products" on products for select using (true);
create policy "Public can view categories" on categories for select using (true);
create policy "Public can view reviews" on reviews for select using (true);

-- Auth users manage their own data
create policy "Users manage own cart" on cart_items
  for all using (auth.uid() = user_id);

create policy "Users manage own wishlist" on wishlist_items
  for all using (auth.uid() = user_id);

create policy "Users view own orders" on orders
  for select using (auth.uid() = user_id);

create policy "Users view own profile" on profiles
  for all using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute procedure update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute procedure update_updated_at();

-- ── INDEXES ──────────────────────────────────
create index idx_products_category on products(category_id);
create index idx_products_brand on products(brand);
create index idx_products_is_featured on products(is_featured) where is_featured = true;
create index idx_cart_user on cart_items(user_id);
create index idx_wishlist_user on wishlist_items(user_id);
create index idx_orders_user on orders(user_id);
