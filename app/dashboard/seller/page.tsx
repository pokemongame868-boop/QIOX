// app/dashboard/seller/page.tsx — Server Component
import Link from 'next/link';
import { getSellerProducts } from '@/lib/actions/products';
import { getProfile } from '@/lib/actions/auth';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import SellerProductTable from '@/components/seller/SellerProductTable';
import { Plus, Package, TrendingUp, DollarSign, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const metadata = { title: 'Панель продавца — QIOX' };

export default async function SellerDashboard() {
  const [products, profile] = await Promise.all([
    getSellerProducts(),
    getProfile(),
  ]);

  const activeCount   = products.filter(p => p.status === 'active').length;
  const totalRevenue  = 0; // Would come from orders in production
  const avgRating     = products.length
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <HeaderWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Панель продавца</h1>
            <p className="text-gray-500 mt-1">Привет, {profile?.full_name} 👋</p>
          </div>
          <Link href="/dashboard/seller/products/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить товар
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего товаров',   value: products.length,  icon: Package,    color: 'text-brand-blue-light' },
            { label: 'Активных',        value: activeCount,      icon: TrendingUp, color: 'text-brand-green'      },
            { label: 'Средний рейтинг', value: avgRating,        icon: Star,       color: 'text-amber-400'        },
            { label: 'Выручка',         value: formatPrice(totalRevenue), icon: DollarSign, color: 'text-violet-400' },
          ].map(s => (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <p className="font-display text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Products table */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
            <h2 className="font-display font-bold text-white">Мои товары</h2>
            <Link href="/dashboard/seller/products/new" className="text-sm text-brand-blue-light hover:text-white transition-colors">
              + Добавить
            </Link>
          </div>
          <SellerProductTable products={products} />
        </div>
      </main>
    </div>
  );
}
