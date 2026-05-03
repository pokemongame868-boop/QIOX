-- ============================================================
-- QIOX Stage 3 — SQL Additions
-- Run in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── 1. Upsert cart item (increment quantity if exists) ──────
-- Called from cart action to avoid race conditions
create or replace function upsert_cart_item(
  p_user_id    uuid,
  p_product_id uuid,
  p_quantity   int default 1
)
returns void language plpgsql security definer as $$
begin
  insert into cart_items (user_id, product_id, quantity)
  values (p_user_id, p_product_id, p_quantity)
  on conflict (user_id, product_id)
  do update set
    quantity   = cart_items.quantity + p_quantity,
    updated_at = now();
end;
$$;

grant execute on function upsert_cart_item(uuid, uuid, int) to authenticated;

-- ── 2. Wishlist RLS (ensure it exists) ──────────────────────
-- Already created in schema.sql but adding policy names for clarity
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'wishlist_items' and policyname = 'Own wishlist'
  ) then
    create policy "Own wishlist" on wishlist_items
      for all using (auth.uid() = user_id);
  end if;
end $$;

-- ── 3. Reviews: ensure RLS for insert ───────────────────────
-- Verified buyer can review (is_verified = true means they purchased)
create or replace function mark_review_verified()
returns trigger language plpgsql security definer as $$
begin
  -- Check if user has a delivered order containing this product
  if exists (
    select 1
    from orders o
    join order_items oi on oi.order_id = o.id
    where o.buyer_id = new.user_id
      and oi.product_id = new.product_id
      and o.status = 'delivered'
  ) then
    new.is_verified := true;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_verify on reviews;
create trigger reviews_verify
  before insert on reviews
  for each row execute procedure mark_review_verified();

-- ── 4. Product full-text search: update existing rows ───────
update products
set search_vector =
  setweight(to_tsvector('russian', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('russian', coalesce(brand, '')), 'B') ||
  setweight(to_tsvector('russian', coalesce(description, '')), 'C')
where search_vector is null;

-- ── 5. Autocomplete search function ─────────────────────────
create or replace function search_products_autocomplete(
  p_query text,
  p_limit int default 8
)
returns table (
  id    uuid,
  name  text,
  brand text,
  slug  text,
  price numeric,
  category_slug text
) language sql stable security definer as $$
  select
    p.id, p.name, p.brand, p.slug, p.price,
    c.slug as category_slug
  from products p
  left join categories c on c.id = p.category_id
  where
    p.status = 'active'
    and (
      p.name  ilike '%' || p_query || '%' or
      p.brand ilike '%' || p_query || '%'
    )
  order by
    case when p.name ilike p_query || '%' then 0 else 1 end,
    p.review_count desc
  limit p_limit;
$$;

grant execute on function search_products_autocomplete(text, int) to anon, authenticated;

-- ── 6. Get category filter options ──────────────────────────
-- Returns distinct spec values for a category (for filter UI)
create or replace function get_category_filter_options(p_category_slug text)
returns jsonb language sql stable security definer as $$
  select jsonb_build_object(
    'brands',
    (
      select jsonb_agg(distinct brand order by brand)
      from products p
      join categories c on c.id = p.category_id
      where c.slug = p_category_slug and p.brand is not null and p.status = 'active'
    ),
    'price_range',
    (
      select jsonb_build_object(
        'min', min(price),
        'max', max(price)
      )
      from products p
      join categories c on c.id = p.category_id
      where c.slug = p_category_slug and p.status = 'active'
    ),
    'spec_templates',
    (
      select jsonb_agg(
        jsonb_build_object(
          'key', st.key,
          'label', st.label,
          'unit', st.unit,
          'data_type', st.data_type,
          'options', st.options
        )
        order by st.sort_order
      )
      from spec_templates st
      join categories c on c.id = st.category_id
      where c.slug = p_category_slug
    )
  );
$$;

grant execute on function get_category_filter_options(text) to anon, authenticated;

-- ── 7. Catalog query with spec filters ──────────────────────
-- Supports filtering by jsonb specs dynamically
create or replace function filter_products(
  p_category_slug text    default null,
  p_brand         text    default null,
  p_min_price     numeric default null,
  p_max_price     numeric default null,
  p_in_stock      boolean default null,
  p_search        text    default null,
  p_specs         jsonb   default null,   -- {"ram":"16","storage":"256"}
  p_sort          text    default 'newest',
  p_limit         int     default 20,
  p_offset        int     default 0
)
returns table (
  id uuid, seller_id uuid, category_id uuid,
  name text, slug text, description text,
  price numeric, old_price numeric,
  images text[], brand text, sku text,
  stock_qty int, status product_status,
  is_featured boolean, rating numeric, review_count int,
  specs jsonb, created_at timestamptz,
  category_name text, category_slug text, category_icon text,
  total_count bigint
) language plpgsql stable security definer as $$
declare
  v_sql text;
  v_where text[] := ARRAY['p.status = ''active'''];
  v_order text;
  v_key text;
  v_val text;
begin
  -- Category filter
  if p_category_slug is not null then
    v_where := v_where || format('c.slug = %L', p_category_slug);
  end if;
  -- Brand filter
  if p_brand is not null then
    v_where := v_where || format('p.brand ilike %L', '%' || p_brand || '%');
  end if;
  -- Price range
  if p_min_price is not null then
    v_where := v_where || format('p.price >= %s', p_min_price);
  end if;
  if p_max_price is not null then
    v_where := v_where || format('p.price <= %s', p_max_price);
  end if;
  -- Stock
  if p_in_stock then
    v_where := v_where || 'p.stock_qty > 0';
  end if;
  -- Search
  if p_search is not null and length(trim(p_search)) > 0 then
    v_where := v_where || format(
      '(p.name ilike %L or p.brand ilike %L or p.description ilike %L)',
      '%'||p_search||'%', '%'||p_search||'%', '%'||p_search||'%'
    );
  end if;
  -- Dynamic spec filters
  if p_specs is not null then
    for v_key, v_val in select * from jsonb_each_text(p_specs) loop
      if v_val is not null and v_val <> '' then
        v_where := v_where || format(
          'p.specs->>%L ilike %L', v_key, '%'||v_val||'%'
        );
      end if;
    end loop;
  end if;

  -- Sort
  v_order := case p_sort
    when 'price_asc'  then 'p.price asc'
    when 'price_desc' then 'p.price desc'
    when 'rating'     then 'p.rating desc'
    when 'popular'    then 'p.review_count desc'
    else 'p.created_at desc'
  end;

  return query execute format(
    'select
       p.id, p.seller_id, p.category_id,
       p.name, p.slug, p.description,
       p.price, p.old_price, p.images, p.brand, p.sku,
       p.stock_qty, p.status, p.is_featured,
       p.rating, p.review_count, p.specs, p.created_at,
       c.name as category_name, c.slug as category_slug, c.icon as category_icon,
       count(*) over() as total_count
     from products p
     left join categories c on c.id = p.category_id
     where %s
     order by %s
     limit %s offset %s',
    array_to_string(v_where, ' and '),
    v_order,
    p_limit,
    p_offset
  );
end;
$$;

grant execute on function filter_products(text,text,numeric,numeric,boolean,text,jsonb,text,int,int) to anon, authenticated;
