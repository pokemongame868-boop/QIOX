// app/catalog/page.tsx — Server Component
// All filtering via URL search params → Supabase RPC

import { Suspense } from 'react';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import FilterPanel from '@/components/catalog/FilterPanel';
import CatalogSort from '@/components/catalog/CatalogSort';
import CatalogPagination from '@/components/catalog/CatalogPagination';
import SearchBar from '@/components/ui/SearchBar';
import { ProductGridSkeleton, FilterSkeleton } from '@/components/ui/Skeletons';
import {
  fetchCatalog, fetchFilterOptions, fetchCategoryTree,
  fetchCategory, CatalogFilters,
} from '@/lib/queries/catalog';
import { getWishlistIds } from '@/lib/actions/wishlist';
import { Package } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  searchParams: Record<string, string | undefined>;
}

const LIMIT = 20;

// Parse specs from URL: spec_cpu=M4&spec_ram=16 → {cpu:"M4",ram:"16"}
function parseSpecs(params: Record<string, string | undefined>): Record<string, string> {
  const specs: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (k.startsWith('spec_') && v) specs[k.slice(5)] = v;
  });
  return specs;
}

export async function generateMetadata({ searchParams }: Props) {
  const cat = searchParams.category;
  if (!cat) return { title: 'Каталог — QIOX' };
  const category = await fetchCategory(cat);
  return { title: `${category?.name ?? 'Каталог'} — QIOX` };
}

export default async function CatalogPage({ searchParams }: Props) {
  const filters: CatalogFilters = {
    category: searchParams.category,
    brand:    searchParams.brand,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    inStock:  searchParams.inStock === 'true',
    search:   searchParams.search,
    specs:    parseSpecs(searchParams),
    sortBy:   searchParams.sort ?? 'newest',
    page:     searchParams.page ? Number(searchParams.page) : 1,
    limit:    LIMIT,
  };

  // All fetches in parallel
  const [catalogResult, categoryTree, wishlistIds] = await Promise.all([
    fetchCatalog(filters),
    fetchCategoryTree(),
    getWishlistIds(),
  ]);

  // Filter options depend on selected category
  const filterOptions = filters.category
    ? await fetchFilterOptions(filters.category)
    : { brands: [], price_range: { min: 0, max: 9999999 }, spec_templates: [] };

  const currentCategory = filters.category
    ? categoryTree.find(c => c.slug === filters.category) ?? null
    : null;

  const { products, total, hasMore } = catalogResult;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 md:py-10 w-full">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white">
            {currentCategory
              ? <>{currentCategory.icon} {currentCategory.name}</>
              : filters.search
              ? <>Поиск: «{filters.search}»</>
              : 'Каталог товаров'}
          </h1>
          {total > 0 && (
            <p className="text-gray-500 mt-1 text-sm">{total.toLocaleString()} товаров</p>
          )}
        </div>

        {/* Search bar (inline, updates URL) */}
        <div className="mb-6">
          <SearchBar
            initialValue={filters.search}
            className="max-w-xl"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-1">
          <Link
            href="/catalog"
            className={cn('category-pill flex-shrink-0', !filters.category && 'border-brand-blue bg-brand-blue/10 text-white')}
          >
            Все товары
          </Link>
          {categoryTree.map(cat => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className={cn(
                'category-pill flex-shrink-0 flex items-center gap-1.5',
                filters.category === cat.slug && 'border-brand-blue bg-brand-blue/10 text-white'
              )}
            >
              <span>{cat.icon}</span> {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Suspense fallback={<FilterSkeleton />}>
              <FilterPanel options={filterOptions} categorySlug={filters.category} />
            </Suspense>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 hidden sm:block">
                Показано {Math.min((filters.page! - 1) * LIMIT + 1, total)}–{Math.min(filters.page! * LIMIT, total)} из {total}
              </p>
              <CatalogSort current={filters.sortBy} />
            </div>

            <Suspense fallback={<ProductGridSkeleton count={LIMIT} />}>
              {products.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center py-24 text-center">
                  <Package className="w-16 h-16 text-gray-700 mb-4" />
                  <h2 className="font-display text-2xl font-bold text-white mb-2">Товары не найдены</h2>
                  <p className="text-gray-500 mb-6">
                    Попробуйте изменить фильтры или поисковый запрос
                  </p>
                  <Link href="/catalog" className="btn-primary">Сбросить фильтры</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      wishlisted={wishlistIds.includes(product.id)}
                    />
                  ))}
                </div>
              )}
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <CatalogPagination current={filters.page!} total={totalPages} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
