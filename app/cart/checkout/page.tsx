// app/cart/checkout/page.tsx
import { redirect } from 'next/navigation';
import { getCart } from '@/lib/actions/cart';
import { getProfile } from '@/lib/actions/auth';
import Header from '@/components/layout/Header';
import CheckoutForm from '@/components/cart/CheckoutForm';

export const metadata = { title: 'Оформление заказа — QIOX' };

export default async function CheckoutPage() {
  const [items, profile] = await Promise.all([getCart(), getProfile()]);

  if (items.length === 0) redirect('/cart');

  const total = items.reduce((sum, i) => sum + (i.line_total ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Оформление заказа</h1>
        <CheckoutForm items={items} total={total} profile={profile} />
      </main>
    </div>
  );
}
