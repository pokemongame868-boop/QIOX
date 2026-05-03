'use server';
// lib/actions/products.ts

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, ProductForm, ProductFilters, Product } from '@/types';

// ── LIST / SEARCH ──────────────────────────────────────────
export async function getProducts(filters: ProductFilters = {}) {
  const supabase = createClient();

  const {
    category, brand, minPrice, maxPrice,
    inStock, search, sortBy = 'newest',
    page = 1, limit = 20,
  } = filters;

  let query = supabase
    .from('products_full')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  if (category) query = query.eq('category_slug', category);
  if (brand)    query = query.ilike('brand', `%${brand}%`);
  if (minPrice) query = query.gte('price', minPrice);
  if (maxPrice) query = query.lte('price', maxPrice);
  if (inStock)  query = query.gt('stock_qty', 0);

  // Full-text search via pg_trgm
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':  query = query.order('price', { ascending: true });  break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'rating':     query = query.order('rating', { ascending: false }); break;
    case 'popular':    query = query.order('review_count', { ascending: false }); break;
    default:           query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return { data: [], total: 0, error: error.message };

  return {
    data: (data ?? []) as Product[],
    total: count ?? 0,
    page,
    limit,
    hasMore: (count ?? 0) > from + limit,
  };
}

// ── GET SINGLE ─────────────────────────────────────────────
export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products_full')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products_full')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// ── CREATE ─────────────────────────────────────────────────
export async function createProduct(
  _prev: ActionResult<Product>,
  formData: FormData
): Promise<ActionResult<Product>> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role ?? user.user_metadata?.role ?? 'buyer';

  if (!['seller', 'admin'].includes(role)) {
    return { error: 'Недостаточно прав' };
  }

  // Parse specs JSON from form
  let specs = {};
  try { specs = JSON.parse(formData.get('specs') as string || '{}'); } catch {}

  const images = formData.getAll('images') as string[];

  const payload = {
    seller_id:   user.id,
    name:        formData.get('name')        as string,
    description: formData.get('description') as string,
    price:       Number(formData.get('price')),
    old_price:   formData.get('old_price') ? Number(formData.get('old_price')) : null,
    category_id: formData.get('category_id') as string,
    brand:       formData.get('brand')       as string,
    stock_qty:   Number(formData.get('stock_qty') || 0),
    status:      (formData.get('status') || 'draft') as ProductForm['status'],
    specs,
    images:      images.filter(Boolean),
    slug: (formData.get('name') as string)
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now(),
  };

  if (!payload.name || !payload.price || !payload.category_id) {
    return { error: 'Название, цена и категория обязательны' };
  }

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single();

  if (error) return { error: `Не удалось создать товар: ${error.message}` };
  revalidatePath('/');
  revalidatePath('/catalog');
  revalidatePath('/dashboard/seller');
  redirect('/dashboard/seller');
}

// ── UPDATE ─────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult<Product>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  let specs = {};
  try { specs = JSON.parse(formData.get('specs') as string || '{}'); } catch {}

  const images = formData.getAll('images') as string[];

  const { data, error } = await supabase
    .from('products')
    .update({
      name:        formData.get('name')        as string,
      description: formData.get('description') as string,
      price:       Number(formData.get('price')),
      old_price:   formData.get('old_price') ? Number(formData.get('old_price')) : null,
      category_id: formData.get('category_id') as string,
      brand:       formData.get('brand')       as string,
      stock_qty:   Number(formData.get('stock_qty')),
      status:      formData.get('status') as ProductForm['status'],
      specs,
      images: images.filter(Boolean),
    })
    .eq('id', id)
    .eq('seller_id', user.id)   // RLS also enforces this
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/product/${data.slug}`);
  revalidatePath('/dashboard/seller');
  return { data: data as Product };
}

// ── DELETE ─────────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/dashboard/seller');
  revalidatePath('/');
  return {};
}

// ── GET FEATURED ───────────────────────────────────────────
export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products_full')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);
  return (data ?? []) as Product[];
}

// ── SELLER'S PRODUCTS ──────────────────────────────────────
export async function getSellerProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as Product[];
}

// ── SEED (call once after creating admin account) ──────────
export async function seedProducts(): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase.rpc('seed_products', { p_seller_id: user.id });
  if (error) return { error: error.message };
  revalidatePath('/');
  return {};
}
