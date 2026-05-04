// app/dashboard/admin/page.tsx — Server Component
import { createClient } from '@/lib/supabase/server';
import { getAllOrders } from '@/lib/actions/orders';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';
import { Users, Package, ShoppingCart, TrendingUp, Sprout } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const metadata = { title: 'Админ-панель — QIOX' };

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    orders,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    getAllOrders(),
  ]);

  const revenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total_price, 0);

  const stats = [
    { label: 'Пользователей', value: usersCount ?? 0,         icon: Users,       color: 'text-brand-blue-light', bg: 'bg-brand-blue/10'  },
    { label: 'Товаров',       value: productsCount ?? 0,      icon: Package,     color: 'text-brand-green',      bg: 'bg-brand-green/10' },
    { label: 'Заказов',       value: ordersCount ?? 0,        icon: ShoppingCart, color: 'text-amber-400',       bg: 'bg-amber-400/10'   },
    { label: 'Выручка',       value: formatPrice(revenue),    icon: TrendingUp,  color: 'text-violet-400',       bg: 'bg-violet-400/10'  },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <HeaderWrapper />
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Админ-панель</h1>
          <p className="text-gray-500 mt-1">Полное управление магазином</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/dashboard/admin/users',    label: 'Управление пользователями', icon: null },
            { href: '/dashboard/admin/products', label: 'Все товары',                icon: null },
            { href: '/dashboard/admin/orders',   label: 'Все заказы',                icon: null },
            { href: '/dashboard/admin/seed',     label: 'Загрузить тест-данные',     icon: Sprout },
          ].map(l => {
            const Icon = l.icon;

            return (
              <a key={l.href} href={l.href}
                className="px-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-sm text-gray-300 hover:text-white hover:border-brand-blue transition-all text-center font-medium inline-flex items-center justify-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {l.label}
              </a>
            );
          })}
        </div>

        {/* Recent orders */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border">
            <h2 className="font-display font-bold text-white">Последние заказы</h2>
          </div>
          <AdminOrdersTable orders={orders.slice(0, 20)} />
        </div>
      </main>
    </div>
  );
}
