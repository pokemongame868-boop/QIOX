// lib/queries/catalog.ts
// All Supabase queries for catalog — called from Server Components

import { createClient } from '@/lib/supabase/server';
import { Product, Category, SpecTemplate } from '@/types';

export interface CatalogFilters {
  category?:  string;   // slug
  brand?:     string;
  minPrice?:  number;
  maxPrice?:  number;
  inStock?:   boolean;
  search?:    string;
  specs?:     Record<string, string>;
  sortBy?:    string;
  page?:      number;
  limit?:     number;
}

export interface CatalogResult {
  products:    Product[];
  total:       number;
  page:        number;
  limit:       number;
  hasMore:     boolean;
}

// ── MAIN CATALOG QUERY (uses filter_products RPC) ──────────
export async function fetchCatalog(filters: CatalogFilters): Promise<CatalogResult> {
  const supabase = createClient();
  const limit = filters.limit ?? 20;
  const page  = filters.page  ?? 1;

  const { data, error } = await supabase.rpc('filter_products', {
    p_category_slug: filters.category  ?? null,
    p_brand:         filters.brand     ?? null,
    p_min_price:     filters.minPrice  ?? null,
    p_max_price:     filters.maxPrice  ?? null,
    p_in_stock:      filters.inStock   ?? null,
    p_search:        filters.search    ?? null,
    p_specs:         filters.specs && Object.keys(filters.specs).length > 0
                       ? filters.specs : null,
    p_sort:          filters.sortBy    ?? 'newest',
    p_limit:         limit,
    p_offset:        (page - 1) * limit,
  });

  if (error) {
    console.error('filter_products RPC error:', error);
    return { products: [], total: 0, page, limit, hasMore: false };
  }

  const total = data?.[0]?.total_count ?? 0;
  return {
    products: (data ?? []) as unknown as Product[],
    total,
    page,
    limit,
    hasMore: total > page * limit,
  };
}

// ── CATEGORY TREE ──────────────────────────────────────────
export interface CategoryWithChildren extends Category {
  children: Category[];
  product_count?: number;
}

export async function fetchCategoryTree(): Promise<CategoryWithChildren[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (!data) return [];

  // Build tree: parent_id = null → root
  const roots  = data.filter(c => !c.parent_id);
  const byParent = data.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = [...(acc[c.parent_id] ?? []), c];
    }
    return acc;
  }, {} as Record<string, Category[]>);

  return roots.map(r => ({
    ...r,
    children: byParent[r.id] ?? [],
  }));
}

// ── SINGLE CATEGORY ────────────────────────────────────────
export async function fetchCategory(slug: string): Promise<Category | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data ?? null;
}

// ── FILTER OPTIONS FOR CATEGORY ────────────────────────────
export interface FilterOptions {
  brands:         string[];
  price_range:    { min: number; max: number };
  spec_templates: SpecTemplate[];
}

export async function fetchFilterOptions(categorySlug: string): Promise<FilterOptions> {
  const supabase = createClient();
  const { data } = await supabase.rpc('get_category_filter_options', {
    p_category_slug: categorySlug,
  });

  return {
    brands:         data?.brands          ?? [],
    price_range:    data?.price_range     ?? { min: 0, max: 9999999 },
    spec_templates: data?.spec_templates  ?? [],
  };
}

// ── AUTOCOMPLETE SEARCH ────────────────────────────────────
export interface AutocompleteResult {
  id:            string;
  name:          string;
  brand:         string;
  slug:          string;
  price:         number;
  category_slug: string;
}

export async function fetchAutocomplete(query: string): Promise<AutocompleteResult[]> {
  if (!query || query.trim().length < 2) return [];

  const supabase = createClient();
  const { data } = await supabase.rpc('search_products_autocomplete', {
    p_query: query.trim(),
    p_limit: 8,
  });

  return (data ?? []) as AutocompleteResult[];
}

// ── PRODUCT WITH FULL DETAILS ──────────────────────────────
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products_full')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  return data as Product | null;
}

export async function fetchRelatedProducts(
  categoryId: string,
  excludeId:  string,
  limit = 4
): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('products_full')
    .select('*')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .neq('id', excludeId)
    .order('rating', { ascending: false })
    .limit(limit);
  return (data ?? []) as Product[];
}
