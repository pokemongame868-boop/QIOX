// app/profile/page.tsx — Server Component
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/actions/auth';
import { getUserOrders } from '@/lib/actions/orders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LogoutButton from '@/components/auth/LogoutButton';
import { formatPrice } from '@/lib/utils';
import { UserRole } from '@/types';
import Link from 'next/link';
import { Package, ShoppingBag, Store, Shield, ChevronRight } from 'lucide-react';

export const metadata = { title: 'Профиль — QIOX' };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ожидает',   color: 'text-amber-400  bg-amber-400/10  border-amber-400/20'  },
  confirmed: { label: 'Подтверждён', color: 'text-blue-400  bg-blue-400/10  border-blue-400/20'  },
  shipped:   { label: 'В доставке', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  delivered: { label: 'Доставлен',  color: 'text-brand-green bg-brand-green/10 border-brand-green/20' },
  cancelled: { label: 'Отменён',    color: 'text-red-400   bg-red-400/10   border-red-400/20'   },
};

const ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Покупатель',
  seller: 'Продавец',
  admin: 'Администратор',
};

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect('/auth/login');

  const orders = await getUserOrders();

  const roleIcon = profile.role === 'admin' ? Shield : profile.role === 'seller' ? Store : ShoppingBag;
  const RoleIcon = roleIcon;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">

        {/* Profile card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-2xl font-display font-bold text-brand-blue-light">
              {(profile.full_name ?? 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">{profile.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <RoleIcon className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm text-gray-400 capitalize">
                  {ROLE_LABELS[profile.role]}
                </span>
                {profile.is_verified && (
                  <span className="text-xs text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded-full">
                    Верифицирован
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {profile.role === 'seller' && (
              <Link href="/dashboard/seller" className="btn-ghost text-sm px-4 py-2">
                Панель продавца
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link href="/dashboard/admin" className="btn-ghost text-sm px-4 py-2">
                Админ-панель
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Orders */}
        <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-blue-light" />
          Мои заказы
          <span className="text-sm text-gray-500 font-normal">({orders.length})</span>
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">Заказов ещё нет</p>
            <Link href="/" className="mt-4 inline-block text-brand-blue-light hover:text-white text-sm transition-colors">
              Перейти в каталог →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const st = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
              return (
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  className="block bg-dark-card border border-dark-border rounded-2xl p-4 hover:border-brand-blue/40 transition-all group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {order.items?.length ?? 0} товар(ов)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-white">
                        {formatPrice(order.total_price)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
