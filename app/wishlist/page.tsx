// app/wishlist/page.tsx — Server Component
import { redirect } from 'next/navigation';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import Footer from '@/components/layout/Footer';
import WishlistClient from '@/components/catalog/WishlistClient';
import { getWishlist } from '@/lib/actions/wishlist';
import { getProfile } from '@/lib/actions/auth';
import { Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Избранное — QIOX' };

export default async function WishlistPage() {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login?next=/wishlist');

  const products = await getWishlist();

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-400" />
          <h1 className="font-display text-3xl font-bold text-white">
            Избранное
            {products.length > 0 && (
              <span className="text-gray-500 text-xl font-normal ml-2">({products.length})</span>
            )}
          </h1>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Heart className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">Список пуст</h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Добавляйте товары в избранное, чтобы не потерять их
            </p>
            <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
          </div>
        ) : (
          <WishlistClient initialProducts={products} />
        )}
      </main>
      <Footer />
    </div>
  );
}
