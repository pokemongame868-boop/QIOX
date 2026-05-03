# QIOX Stage 3 — Verification Guide

## Setup (run once)

```bash
# 1. Run in Supabase SQL Editor
#    supabase/schema.sql            (Stage 1-2 schema)
#    supabase/stage3-additions.sql  (Stage 3 functions)

# 2. Register an account → go to /dashboard/admin/seed
#    This inserts 9 real products via seed_products() RPC

# 3. npm run dev → http://localhost:3000
```

---

## ✅ Feature Verification Checklist

### 1. Search with Autocomplete
```
1. Open http://localhost:3000
2. Click the search bar in the hero
3. Type "iph" — see autocomplete dropdown from Supabase
4. Click a suggestion → navigates to product page
5. Press Enter → navigates to /catalog?search=...

Key query: search_products_autocomplete('iph', 8)
```

### 2. Catalog + Filters
```
1. Go to /catalog
2. Click category chip "Смартфоны"
3. URL becomes /catalog?category=smartphones
4. Filter panel loads brands (Apple, Samsung) from DB
5. Check "Apple" → click "Применить" → products filtered
6. Change sort → URL updates → page re-renders server-side

Key query: filter_products(p_category_slug='smartphones', p_brand='Apple', ...)
```

### 3. Product Page with Real Specs
```
1. Click any product card
2. Product page shows:
   - Real images from Supabase
   - Specs from products.specs JSONB column
   - Rating from reviews table (auto-calculated by trigger)
   - Related products from same category

Key queries:
  products_full view (JOIN categories + profiles)
  get_category_filter_options(slug)
```

### 4. Add to Cart
```
1. Click "В корзину" on any product
2. Toast notification appears: "Добавлено в корзину"
3. Cart counter in header increments
4. Go to /cart — item appears

Under the hood:
  addToCart(productId, 1)
  → upsert_cart_item RPC (increments if already in cart)
  → cart_full view returns updated cart
```

### 5. Wishlist (Optimistic UI)
```
1. Hover a product card → heart icon appears
2. Click heart → instantly turns red (optimistic)
3. Toast: "Добавлено в избранное"
4. Go to /wishlist — product appears
5. Click trash → product instantly disappears (optimistic)
6. Toggle off network → heart click still updates UI, 
   then reverts on error

Key action: toggleWishlist(productId) → sets/removes wishlist_items row
```

### 6. Reviews
```
1. Go to any product page
2. Scroll to "Отзывы" section
3. If not logged in → see "Войти" prompt
4. Log in → return to product
5. Rating stars appear — click 5 stars
6. Type review → submit
7. Review appears instantly (client-side append)
8. Rating stats update after page refresh (trigger recalculates)

Constraint: unique(product_id, user_id) prevents duplicate reviews
Trigger: reviews_update_rating() → updates products.rating after insert
```

### 7. Real-time Cart Count
```
Header fetches getCartCount() on every server render.
Cart badge shows accurate count from Supabase.
```

---

## Supabase Queries Reference

```sql
-- 1. Autocomplete
SELECT * FROM search_products_autocomplete('iphone', 8);

-- 2. Catalog with filters
SELECT * FROM filter_products(
  p_category_slug := 'smartphones',
  p_brand := 'Apple',
  p_sort := 'price_asc',
  p_limit := 20,
  p_offset := 0
);

-- 3. Filter options for category
SELECT get_category_filter_options('laptops');

-- 4. Cart contents
SELECT * FROM cart_full WHERE user_id = '<user-uuid>';

-- 5. Wishlist
SELECT wi.*, p.name, p.price
FROM wishlist_items wi
JOIN products p ON p.id = wi.product_id
WHERE wi.user_id = '<user-uuid>';

-- 6. Reviews with user
SELECT r.*, pr.full_name
FROM reviews r
JOIN profiles pr ON pr.id = r.user_id
WHERE r.product_id = '<product-uuid>'
ORDER BY r.created_at DESC;

-- 7. Checkout (clears cart → creates order)
SELECT checkout_cart(
  '<buyer-uuid>',
  '{"city":"Алматы","street":"ул. Абая 1","zip":"050000","country":"Казахстан"}',
  'card'
);
```

---

## Architecture Decisions

| Concern | Solution | Why |
|---|---|---|
| Catalog filters | `filter_products()` SQL RPC | Dynamic JSONB spec filtering not possible with ORM |
| Autocomplete | `search_products_autocomplete()` RPC | Server-side, indexed, no client secrets |
| Debounce | 320ms in `SearchBar.tsx` useEffect | Prevents spam, feels instant |
| Optimistic UI | Local state + revert on error | Wishlist/cart feel instant |
| Rating calc | DB trigger on reviews | Always consistent, no stale cache |
| Server/Client split | Server=data, Client=interactivity | RSC for SEO + perf |
| Toast | Context + Portal | Global, composable, no prop drilling |
