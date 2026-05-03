// app/page.tsx — Server Component (Stage 3: all data from Supabase)
import { Suspense } from 'react';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import HeroSearch from '@/components/home/HeroSearch';
import BannerSlider from '@/components/home/BannerSlider';
import Categories from '@/components/home/Categories';
import TrustBar from '@/components/home/TrustBar';
import ProductGrid from '@/components/home/ProductGrid';
import { BANNERS } from '@/lib/mock-data';
import { fetchCatalog, fetchCategoryTree } from '@/lib/queries/catalog';
import { getWishlistIds } from '@/lib/actions/wishlist';
import { ProductGridSkeleton } from '@/components/ui/Skeletons';

export default async function HomePage() {
  // Parallel fetches — no mock data
  const [catalogResult, categories, wishlistIds] = await Promise.all([
    fetchCatalog({ sortBy: 'popular', limit: 8 }),
    fetchCategoryTree(),
    getWishlistIds(),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-8 pb-10 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-glow-blue opacity-40 blur-3xl" />
            <div className="absolute inset-0 bg-grid-dark bg-grid opacity-20" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-xs text-brand-blue-light font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                {catalogResult.total > 0 ? `${catalogResult.total.toLocaleString()} товаров в наличии` : 'Электроника нового поколения'}
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight text-balance">
                Электроника <span className="gradient-text">нового поколения</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
                Официальные гарантии. Быстрая доставка по Казахстану.
              </p>
            </div>
            <HeroSearch />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-10">
          <BannerSlider banners={BANNERS} />
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-12">
          <TrustBar />
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-12">
          <Categories categories={categories as any} />
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-16">
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <ProductGrid
              products={catalogResult.products}
              title="Популярные товары"
              subtitle="Самые покупаемые этой недели"
              wishlistIds={wishlistIds}
            />
          </Suspense>
        </section>

        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue/20 via-dark-surface to-dark-surface border border-brand-blue/20 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-glow-blue opacity-30 pointer-events-none" />
            <div className="relative">
              <p className="text-brand-blue-light text-sm font-semibold uppercase tracking-widest mb-3">Специальное предложение</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Первый заказ со скидкой <span className="text-brand-green">5%</span>
              </h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Промокод <strong className="text-white">QIOX5</strong> — скидка на любой товар при первом заказе
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input type="email" placeholder="Ваш email"
                  className="flex-1 px-5 py-3 rounded-xl bg-dark-bg border border-dark-border text-white placeholder-gray-500 outline-none focus:border-brand-blue transition-colors text-sm" />
                <button className="btn-primary whitespace-nowrap">Получить скидку</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
