// app/cart/page.tsx
import { getCart } from '@/lib/actions/cart';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartClient from '@/components/cart/CartClient';

export const metadata = { title: 'Корзина — QIOX' };

export default async function CartPage() {
  const items = await getCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <h1 className="font-display text-3xl font-bold text-white mb-6">
          Корзина{items.length > 0 && <span className="text-gray-500 ml-2 text-xl">({items.length})</span>}
        </h1>
        <CartClient initialItems={items} />
      </main>
      <Footer />
    </div>
  );
}
