// app/product/[slug]/page.tsx — Server Component
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import ImageGallery from '@/components/product/ImageGallery';
import ReviewsSection from '@/components/product/ReviewsSection';
import ProductCard from '@/components/ui/ProductCard';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WishlistButton from '@/components/ui/WishlistButton';
import { fetchProductBySlug, fetchRelatedProducts } from '@/lib/queries/catalog';
import { getProductReviews, getUserReview, getReviewStats } from '@/lib/actions/reviews';
import { getWishlistIds } from '@/lib/actions/wishlist';
import { getProfile } from '@/lib/actions/auth';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { Star, ChevronRight, Shield, Truck, RotateCcw, Zap } from 'lucide-react';
import { ProductPageSkeleton } from '@/components/ui/Skeletons';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { title: 'Товар не найден — QIOX' };
  return {
    title: `${product.name} — QIOX`,
    description: product.description ?? undefined,
    openGraph: { images: product.images?.[0] ? [product.images[0]] : [] },
  };
}

// ── Spec table ────────────────────────────────────────────
function SpecTable({ specs }: { specs: Record<string, unknown> }) {
  const entries = Object.entries(specs).filter(([, v]) => v !== null && v !== '');
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-dark-border rounded-xl overflow-hidden">
      {entries.map(([key, val]) => (
        <div key={key} className="flex items-center justify-between px-4 py-3 bg-dark-surface">
          <span className="text-sm text-gray-500 capitalize">{key}</span>
          <span className="text-sm font-medium text-white">{String(val)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function ProductPage({ params }: Props) {
  // All data fetches run in parallel
  const [product, profile] = await Promise.all([
    fetchProductBySlug(params.slug),
    getProfile(),
  ]);

  if (!product) notFound();

  const [reviews, reviewStats, wishlistIds, related] = await Promise.all([
    getProductReviews(product.id),
    getReviewStats(product.id),
    getWishlistIds(),
    fetchRelatedProducts(product.category_id ?? '', product.id),
  ]);

  const userReview  = profile ? await getUserReview(product.id) : null;
  const isWishlisted = wishlistIds.includes(product.id);
  const discount     = product.old_price ? calculateDiscount(product.price, product.old_price) : null;
  const inStock      = (product.stock_qty ?? 0) > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 md:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <a href="/"       className="hover:text-white transition-colors">Главная</a>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <a href="/catalog" className="hover:text-white transition-colors">Каталог</a>
          {product.category_slug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <a href={`/catalog/${product.category_slug}`} className="hover:text-white transition-colors">
                {product.category_icon} {product.category_name}
              </a>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main grid */}
        <Suspense fallback={<ProductPageSkeleton />}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14 mb-14">
            {/* Left: Gallery */}
            <ImageGallery
              images={product.images ?? []}
              productName={product.name}
              categorySlug={product.category_slug ?? undefined}
            />

            {/* Right: Info */}
            <div className="space-y-5">
              {/* Brand + stock */}
              <div className="flex items-center justify-between">
                <span className="text-brand-blue-light text-sm font-bold uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                  inStock
                    ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {inStock ? `✓ В наличии (${product.stock_qty} шт.)` : '✗ Нет в наличии'}
                </span>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              {reviewStats.count > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${
                        i <= Math.round(reviewStats.avg)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-700 text-gray-700'
                      }`} />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">{reviewStats.avg}</span>
                  <a href="#reviews" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {reviewStats.count.toLocaleString()} отзывов
                  </a>
                </div>
              )}

              {/* Price */}
              <div className="flex items-end gap-4">
                <p className="font-display text-4xl font-bold text-white">
                  {formatPrice(product.price)}
                </p>
                {product.old_price && (
                  <div className="flex flex-col pb-1">
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.old_price)}
                    </span>
                    <span className="text-xs text-orange-400 font-semibold">
                      Экономия {formatPrice(product.old_price - product.price)} (-{discount}%)
                    </span>
                  </div>
                )}
              </div>

              {/* Add to cart */}
              <div className="space-y-3">
                <AddToCartButton
                  productId={product.id}
                  inStock={inStock}
                  size="lg"
                  showLabel
                />
                <div className="grid grid-cols-2 gap-3">
                  <WishlistButton
                    productId={product.id}
                    initialState={isWishlisted}
                    size="lg"
                    showLabel
                  />
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dark-border text-gray-400 hover:border-gray-600 hover:text-white text-sm font-medium transition-all">
                    Поделиться
                  </button>
                </div>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  { icon: Truck,      label: 'Доставка 1-3 дня',  color: 'text-brand-blue-light' },
                  { icon: Shield,     label: 'Гарантия 12 мес.',  color: 'text-brand-green'      },
                  { icon: RotateCcw,  label: 'Возврат 30 дней',   color: 'text-amber-400'        },
                  { icon: Zap,        label: 'Оригинальный товар', color: 'text-violet-400'       },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-dark-card border border-dark-border">
                    <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                    <span className="text-xs text-gray-300 font-medium leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Suspense>

        {/* Tabs: Description / Specs / Reviews */}
        <div className="mb-14" id="details">
          <div className="flex gap-1 mb-6 p-1 bg-dark-surface border border-dark-border rounded-xl w-fit overflow-x-auto">
            {['Описание', 'Характеристики', `Отзывы (${reviewStats.count})`].map((tab, i) => (
              <a key={tab} href={`#${['description','specs','reviews'][i]}`}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  i === 0 ? 'bg-brand-blue text-white' : 'text-gray-500 hover:text-white'
                }`}>
                {tab}
              </a>
            ))}
          </div>

          <div className="space-y-8">
            {/* Description */}
            <section id="description" className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-white mb-3">О товаре</h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {product.description ?? 'Описание отсутствует.'}
              </p>
            </section>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <section id="specs" className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-lg font-bold text-white mb-4">Характеристики</h2>
                <SpecTable specs={product.specs as Record<string, unknown>} />
              </section>
            )}

            {/* Reviews */}
            <section id="reviews" className="bg-dark-card border border-dark-border rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
                Отзывы
                {reviewStats.count > 0 && (
                  <span className="text-sm text-gray-500 font-normal">({reviewStats.count})</span>
                )}
              </h2>
              <ReviewsSection
                productId={product.id}
                reviews={reviews}
                stats={reviewStats}
                isLoggedIn={!!profile}
                hasReviewed={!!userReview}
              />
            </section>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-white mb-5">Похожие товары</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} wishlisted={wishlistIds.includes(p.id)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
