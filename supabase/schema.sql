-- ============================================================
-- QIOX Store — Full Supabase Schema v2
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. Extensions
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- full-text search


-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ────────────────────────────────────────────────────────────
create type user_role   as enum ('buyer', 'seller', 'admin');
create type order_status as enum ('pending','confirmed','shipped','delivered','cancelled');
create type product_status as enum ('draft', 'active', 'archived');


-- ────────────────────────────────────────────────────────────
-- 2. PROFILES  (extends auth.users 1-to-1)
-- ────────────────────────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         user_role    not null default 'buyer',
  full_name    text,
  avatar_url   text,
  phone        text,
  address      jsonb,          -- {city, street, zip, country}
  is_verified  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'buyer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at helper
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;


-- ────────────────────────────────────────────────────────────
-- 3. CATEGORIES
-- ────────────────────────────────────────────────────────────
create table categories (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text not null unique,
  icon         text,
  description  text,
  image_url    text,
  parent_id    uuid references categories(id) on delete set null,
  sort_order   int  default 0,
  is_active    boolean default true,
  created_at   timestamptz default now()
);


-- ────────────────────────────────────────────────────────────
-- 4. SPEC TEMPLATES  (defines allowed keys per category)
-- ────────────────────────────────────────────────────────────
create table spec_templates (
  id           uuid primary key default uuid_generate_v4(),
  category_id  uuid not null references categories(id) on delete cascade,
  key          text not null,
  label        text not null,          -- human-readable
  unit         text,                   -- ГГц, ГБ, мАч …
  data_type    text default 'text',    -- text | number | boolean | enum
  options      text[],                 -- for enum type
  is_required  boolean default false,
  sort_order   int  default 0,
  unique(category_id, key)
);


-- ────────────────────────────────────────────────────────────
-- 5. PRODUCTS
-- ────────────────────────────────────────────────────────────
create table products (
  id            uuid primary key default uuid_generate_v4(),
  seller_id     uuid not null references profiles(id) on delete cascade,
  category_id   uuid references categories(id) on delete set null,
  name          text not null,
  slug          text not null unique,
  description   text,
  price         numeric(12,2) not null check (price >= 0),
  old_price     numeric(12,2) check (old_price >= 0),
  images        text[] default '{}',
  brand         text,
  sku           text unique,
  stock_qty     int  not null default 0 check (stock_qty >= 0),
  status        product_status not null default 'draft',
  is_featured   boolean default false,
  rating        numeric(3,2)  default 0,
  review_count  int default 0,
  specs         jsonb default '{}',    -- { "cpu": "M4", "ram": "16", ... }
  search_vector tsvector,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Indexes
create index idx_products_category   on products(category_id) where status = 'active';
create index idx_products_seller     on products(seller_id);
create index idx_products_featured   on products(is_featured) where is_featured and status = 'active';
create index idx_products_brand      on products(brand);
create index idx_products_search     on products using gin(search_vector);
create index idx_products_specs      on products using gin(specs);
create index idx_products_slug       on products(slug);

-- Full-text search auto-update
create or replace function update_product_search()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('russian', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(new.brand, '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(new.description, '')), 'C');
  return new;
end;
$$;

create trigger products_search_update
  before insert or update on products
  for each row execute procedure update_product_search();

create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 6. REVIEWS
-- ────────────────────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  title       text,
  comment     text,
  is_verified boolean default false,   -- purchased before review
  created_at  timestamptz default now(),
  unique(product_id, user_id)
);

create index idx_reviews_product on reviews(product_id);

-- Update product rating on review change
create or replace function update_product_rating()
returns trigger language plpgsql as $$
declare
  v_product_id uuid;
begin
  v_product_id := coalesce(new.product_id, old.product_id);
  update products
  set
    rating       = (select round(avg(rating)::numeric, 2) from reviews where product_id = v_product_id),
    review_count = (select count(*) from reviews where product_id = v_product_id)
  where id = v_product_id;
  return new;
end;
$$;

create trigger reviews_update_rating
  after insert or update or delete on reviews
  for each row execute procedure update_product_rating();


-- ────────────────────────────────────────────────────────────
-- 7. CART
-- ────────────────────────────────────────────────────────────
create table cart_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  quantity    int  not null default 1 check (quantity > 0),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, product_id)
);

create index idx_cart_user on cart_items(user_id);

create trigger cart_updated_at
  before update on cart_items
  for each row execute procedure set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 8. WISHLIST
-- ────────────────────────────────────────────────────────────
create table wishlist_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);


-- ────────────────────────────────────────────────────────────
-- 9. ORDERS
-- ────────────────────────────────────────────────────────────
create table orders (
  id              uuid primary key default uuid_generate_v4(),
  buyer_id        uuid not null references profiles(id) on delete set null,
  status          order_status not null default 'pending',
  total_price     numeric(12,2) not null,
  shipping_addr   jsonb,          -- snapshot at order time
  payment_method  text default 'cash',
  payment_status  text default 'pending',
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  uuid references products(id) on delete set null,
  seller_id   uuid references profiles(id) on delete set null,
  quantity    int  not null check (quantity > 0),
  unit_price  numeric(12,2) not null,  -- snapshot
  product_snapshot jsonb           -- full product data at purchase time
);

create index idx_orders_buyer  on orders(buyer_id);
create index idx_orders_status on orders(status);

create trigger orders_updated_at
  before update on orders
  for each row execute procedure set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 10. CHECKOUT FROM CART  (stored procedure)
-- ────────────────────────────────────────────────────────────
create or replace function checkout_cart(
  p_buyer_id      uuid,
  p_shipping_addr jsonb,
  p_payment_method text default 'cash'
)
returns uuid language plpgsql security definer as $$
declare
  v_order_id  uuid;
  v_total     numeric(12,2) := 0;
  v_item      record;
begin
  -- Validate cart not empty
  if not exists (select 1 from cart_items where user_id = p_buyer_id) then
    raise exception 'Cart is empty';
  end if;

  -- Calculate total & validate stock
  for v_item in
    select ci.quantity, p.price, p.stock_qty, p.id as product_id, p.name, p.seller_id
    from cart_items ci join products p on p.id = ci.product_id
    where ci.user_id = p_buyer_id
  loop
    if v_item.stock_qty < v_item.quantity then
      raise exception 'Insufficient stock for %', v_item.name;
    end if;
    v_total := v_total + (v_item.price * v_item.quantity);
  end loop;

  -- Create order
  insert into orders (buyer_id, status, total_price, shipping_addr, payment_method)
  values (p_buyer_id, 'pending', v_total, p_shipping_addr, p_payment_method)
  returning id into v_order_id;

  -- Create order items & decrement stock
  for v_item in
    select ci.quantity, p.price, p.id as product_id, p.seller_id,
           row_to_json(p) as snapshot
    from cart_items ci join products p on p.id = ci.product_id
    where ci.user_id = p_buyer_id
  loop
    insert into order_items (order_id, product_id, seller_id, quantity, unit_price, product_snapshot)
    values (v_order_id, v_item.product_id, v_item.seller_id, v_item.quantity, v_item.price, v_item.snapshot::jsonb);

    update products set stock_qty = stock_qty - v_item.quantity where id = v_item.product_id;
  end loop;

  -- Clear cart
  delete from cart_items where user_id = p_buyer_id;

  return v_order_id;
end;
$$;


-- ────────────────────────────────────────────────────────────
-- 11. HELPER VIEWS
-- ────────────────────────────────────────────────────────────

-- Products with category & seller info
create view products_full as
  select
    p.*,
    c.name        as category_name,
    c.slug        as category_slug,
    c.icon        as category_icon,
    pr.full_name  as seller_name,
    pr.is_verified as seller_verified
  from products p
  left join categories c  on c.id = p.category_id
  left join profiles   pr on pr.id = p.seller_id;

-- Cart with product details
create view cart_full as
  select
    ci.id,
    ci.user_id,
    ci.quantity,
    ci.created_at,
    p.id          as product_id,
    p.name        as product_name,
    p.price,
    p.old_price,
    p.images,
    p.brand,
    p.stock_qty,
    p.status      as product_status,
    (p.price * ci.quantity) as line_total
  from cart_items ci
  join products p on p.id = ci.product_id;


-- ────────────────────────────────────────────────────────────
-- 12. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
alter table profiles        enable row level security;
alter table categories      enable row level security;
alter table spec_templates  enable row level security;
alter table products        enable row level security;
alter table reviews         enable row level security;
alter table cart_items      enable row level security;
alter table wishlist_items  enable row level security;
alter table orders          enable row level security;
alter table order_items     enable row level security;

-- Helper: get current user role
create or replace function current_user_role()
returns user_role language sql stable security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- ── PROFILES ──
create policy "Own profile visible"    on profiles for select using (auth.uid() = id);
create policy "Own profile editable"   on profiles for update using (auth.uid() = id);
create policy "Admin sees all"         on profiles for all using (current_user_role() = 'admin');

-- ── CATEGORIES ──
create policy "Anyone reads categories"  on categories for select using (is_active = true);
create policy "Admin manages categories" on categories for all using (current_user_role() = 'admin');

-- ── SPEC TEMPLATES ──
create policy "Anyone reads specs"      on spec_templates for select using (true);
create policy "Admin manages specs"     on spec_templates for all using (current_user_role() = 'admin');

-- ── PRODUCTS ──
create policy "Active products visible" on products for select
  using (status = 'active' or seller_id = auth.uid() or current_user_role() = 'admin');

create policy "Sellers insert own"      on products for insert
  with check (seller_id = auth.uid() and current_user_role() in ('seller','admin'));

create policy "Sellers update own"      on products for update
  using (seller_id = auth.uid() or current_user_role() = 'admin');

create policy "Sellers delete own"      on products for delete
  using (seller_id = auth.uid() or current_user_role() = 'admin');

-- ── REVIEWS ──
create policy "Anyone reads reviews"    on reviews for select using (true);
create policy "Auth users write review" on reviews for insert with check (auth.uid() = user_id);
create policy "Own review editable"     on reviews for update using (auth.uid() = user_id);
create policy "Own review deletable"    on reviews for delete using (auth.uid() = user_id or current_user_role() = 'admin');

-- ── CART ──
create policy "Own cart"               on cart_items for all using (auth.uid() = user_id);

-- ── WISHLIST ──
create policy "Own wishlist"           on wishlist_items for all using (auth.uid() = user_id);

-- ── ORDERS ──
create policy "Own orders"             on orders for select using (auth.uid() = buyer_id or current_user_role() = 'admin');
create policy "Create own order"       on orders for insert with check (auth.uid() = buyer_id);
create policy "Admin updates orders"   on orders for update using (current_user_role() = 'admin');
create policy "Own order items"        on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.buyer_id = auth.uid() or current_user_role() = 'admin')));


-- ────────────────────────────────────────────────────────────
-- 13. SEED DATA
-- ────────────────────────────────────────────────────────────

-- Categories
insert into categories (id, name, slug, icon, description, sort_order) values
  ('10000000-0000-4000-8000-000000000001', 'Смартфоны',        'smartphones',  '📱', 'Флагманы и бюджетники',          1),
  ('10000000-0000-4000-8000-000000000002', 'Ноутбуки',         'laptops',      '💻', 'Для работы, учёбы и игр',        2),
  ('10000000-0000-4000-8000-000000000003', 'Бытовая техника',  'appliances',   '🏠', 'Умный дом и бытовые приборы',    3),
  ('10000000-0000-4000-8000-000000000004', 'Наушники',         'headphones',   '🎧', 'Hi-Fi и беспроводные',           4),
  ('10000000-0000-4000-8000-000000000005', 'Планшеты',         'tablets',      '📟', 'iPad и Android планшеты',        5),
  ('10000000-0000-4000-8000-000000000006', 'Игры',             'gaming',       '🎮', 'Консоли и аксессуары',           6)
on conflict do nothing;

-- Spec templates: Smartphones
insert into spec_templates (category_id, key, label, unit, data_type, sort_order, is_required) values
  ('10000000-0000-4000-8000-000000000001', 'cpu',       'Процессор',      null,  'text',   1, true),
  ('10000000-0000-4000-8000-000000000001', 'ram',       'ОЗУ',            'ГБ',  'number', 2, true),
  ('10000000-0000-4000-8000-000000000001', 'storage',   'Память',         'ГБ',  'number', 3, true),
  ('10000000-0000-4000-8000-000000000001', 'display',   'Дисплей',        null,  'text',   4, false),
  ('10000000-0000-4000-8000-000000000001', 'camera',    'Камера',         'Мп',  'number', 5, false),
  ('10000000-0000-4000-8000-000000000001', 'battery',   'Батарея',        'мАч', 'number', 6, false),
  ('10000000-0000-4000-8000-000000000001', 'os',        'ОС',             null,  'text',   7, false)
on conflict do nothing;

-- Spec templates: Laptops
insert into spec_templates (category_id, key, label, unit, data_type, sort_order, is_required) values
  ('10000000-0000-4000-8000-000000000002', 'cpu',       'Процессор',      null,  'text',   1, true),
  ('10000000-0000-4000-8000-000000000002', 'ram',       'ОЗУ',            'ГБ',  'number', 2, true),
  ('10000000-0000-4000-8000-000000000002', 'storage',   'SSD',            'ГБ',  'number', 3, true),
  ('10000000-0000-4000-8000-000000000002', 'gpu',       'Видеокарта',     null,  'text',   4, false),
  ('10000000-0000-4000-8000-000000000002', 'display',   'Дисплей',        null,  'text',   5, false),
  ('10000000-0000-4000-8000-000000000002', 'battery_h', 'Автономность',   'ч',   'number', 6, false),
  ('10000000-0000-4000-8000-000000000002', 'weight',    'Вес',            'кг',  'number', 7, false)
on conflict do nothing;

-- Spec templates: Appliances
insert into spec_templates (category_id, key, label, unit, data_type, sort_order, is_required) values
  ('10000000-0000-4000-8000-000000000003', 'type',      'Тип',            null,  'text',   1, true),
  ('10000000-0000-4000-8000-000000000003', 'power',     'Мощность',       'Вт',  'number', 2, false),
  ('10000000-0000-4000-8000-000000000003', 'noise',     'Уровень шума',   'дБ',  'number', 3, false),
  ('10000000-0000-4000-8000-000000000003', 'filter',    'Фильтрация',     null,  'text',   4, false)
on conflict do nothing;

-- NOTE: Products below reference a "system seller".
-- In production run after creating a real seller user.
-- Here we insert with a placeholder — update seller_id after seeding auth user.

-- We'll create a seed function instead, callable after signup:
create or replace function seed_products(p_seller_id uuid)
returns void language plpgsql security definer as $$
begin

-- ── SMARTPHONES ──────────────────────────────────────────
insert into products (seller_id, category_id, name, slug, description, price, old_price, brand, sku, stock_qty, status, is_featured, specs, images)
values
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000001',
  'Apple iPhone 16 Pro Max 256GB Natural Titanium',
  'apple-iphone-16-pro-max-256',
  'Флагман Apple с чипом A18 Pro, профессиональной системой камер 48 Мп и дисплеем 6.9" Super Retina XDR ProMotion 120 Гц. Титановый корпус, Action Button, USB-C 3.0.',
  189990, 219990,
  'Apple', 'APL-IP16PM-256-TI',
  42, 'active', true,
  '{"cpu":"Apple A18 Pro","ram":"8","storage":"256","display":"6.9\" Super Retina XDR 120Гц","camera":"48","battery":"4685","os":"iOS 18"}',
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000001',
  'Samsung Galaxy S25 Ultra 512GB Titanium Black',
  'samsung-galaxy-s25-ultra-512',
  'Флагман Samsung с 200 Мп камерой, встроенным стилусом S Pen, чипом Snapdragon 8 Elite и Galaxy AI. Titanium-корпус, 5000 мАч с быстрой зарядкой 45 Вт.',
  159990, 199990,
  'Samsung', 'SAM-S25U-512-BK',
  28, 'active', true,
  '{"cpu":"Snapdragon 8 Elite","ram":"12","storage":"512","display":"6.9\" Dynamic AMOLED 2X 120Гц","camera":"200","battery":"5000","os":"Android 15"}',
  ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000001',
  'Apple iPhone 15 128GB Black',
  'apple-iphone-15-128-black',
  'Предыдущий флагман Apple с чипом A16 Bionic, Dynamic Island, USB-C и камерой 48 Мп. Отличный выбор по цене.',
  119990, 149990,
  'Apple', 'APL-IP15-128-BK',
  65, 'active', false,
  '{"cpu":"Apple A16 Bionic","ram":"6","storage":"128","display":"6.1\" Super Retina XDR","camera":"48","battery":"3877","os":"iOS 18"}',
  ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000001',
  'Samsung Galaxy A55 5G 256GB Awesome Iceblue',
  'samsung-galaxy-a55-256-iceblue',
  'Средний класс с флагманскими функциями: AMOLED 120 Гц, тройная камера 50 Мп, IP67 защита, 5000 мАч.',
  59990, 74990,
  'Samsung', 'SAM-A55-256-IB',
  120, 'active', false,
  '{"cpu":"Exynos 1480","ram":"8","storage":"256","display":"6.6\" Super AMOLED 120Гц","camera":"50","battery":"5000","os":"Android 15"}',
  ARRAY['https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600']
),

-- ── LAPTOPS ──────────────────────────────────────────────
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000002',
  'Apple MacBook Pro 16" M4 Pro 24GB/512GB Space Black',
  'apple-macbook-pro-16-m4-pro',
  'Профессиональный ноутбук с чипом M4 Pro (12 CPU + 20 GPU), 24 ГБ RAM, 512 ГБ SSD, дисплеем Liquid Retina XDR 120 Гц и батареей до 22 часов.',
  579990, null,
  'Apple', 'APL-MBP16-M4P-512',
  15, 'active', true,
  '{"cpu":"Apple M4 Pro (12-core)","ram":"24","storage":"512","gpu":"20-core GPU","display":"16.2\" Liquid Retina XDR 120Гц","battery_h":"22","weight":"2.14"}',
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000002',
  'ASUS ROG Zephyrus G16 Intel Core Ultra 9 / RTX 4080',
  'asus-rog-zephyrus-g16-2024',
  'Топовый игровой ноутбук с OLED-дисплеем 240 Гц, RTX 4080 16 ГБ, Core Ultra 9 185H, 32 ГБ DDR5, 1 ТБ NVMe.',
  449990, null,
  'ASUS', 'ASUS-ROG-G16-4080',
  8, 'active', false,
  '{"cpu":"Intel Core Ultra 9 185H","ram":"32","storage":"1000","gpu":"NVIDIA RTX 4080 16ГБ","display":"16\" OLED 240Гц QHD","battery_h":"10","weight":"1.85"}',
  ARRAY['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000002',
  'Lenovo ThinkPad X1 Carbon Gen 12 Intel Ultra 7',
  'lenovo-thinkpad-x1-carbon-g12',
  'Бизнес-ультрабук с Intel Core Ultra 7, 32 ГБ LPDDR5, 1 ТБ SSD, дисплеем 14" IPS 2K, весом 1.12 кг.',
  349990, 399990,
  'Lenovo', 'LNV-X1C-G12-U7',
  22, 'active', false,
  '{"cpu":"Intel Core Ultra 7 165U","ram":"32","storage":"1000","gpu":"Intel Arc Graphics","display":"14\" IPS 2K 60Гц","battery_h":"15","weight":"1.12"}',
  ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600']
),

-- ── APPLIANCES ───────────────────────────────────────────
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000003',
  'Dyson V15 Detect Absolute',
  'dyson-v15-detect-absolute',
  'Беспроводной пылесос с лазерным обнаружением пыли на твёрдых полах, HEPA-фильтрацией, акустическим датчиком пыли и 60 мин. автономной работы.',
  119990, 139990,
  'Dyson', 'DYS-V15-DET-ABS',
  34, 'active', false,
  '{"type":"Беспроводной вертикальный","power":"240","noise":"79","filter":"HEPA H13"}',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600']
),
(
  p_seller_id,
  '10000000-0000-4000-8000-000000000003',
  'Samsung Bespoke Jet AI Stick Vacuum',
  'samsung-bespoke-jet-ai',
  'Умный беспроводной пылесос с AI-распознаванием типа покрытия, автоматической регулировкой мощности и 210 Вт всасывания.',
  89990, 109990,
  'Samsung', 'SAM-BJET-AI-SV',
  18, 'active', false,
  '{"type":"Беспроводной вертикальный","power":"210","noise":"75","filter":"Multi Cyclone + HEPA"}',
  ARRAY['https://images.unsplash.com/photo-1527515545081-5db817172677?w=600']
)
on conflict (slug) do nothing;

end;
$$;

-- ────────────────────────────────────────────────────────────
-- 14. GRANT permissions for views
-- ────────────────────────────────────────────────────────────
grant select on products_full  to anon, authenticated;
grant select on cart_full      to authenticated;
grant execute on function checkout_cart(uuid, jsonb, text) to authenticated;
grant execute on function seed_products(uuid) to authenticated;
