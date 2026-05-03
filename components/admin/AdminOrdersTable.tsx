'use client';
// components/admin/AdminOrdersTable.tsx

import { useState, useTransition } from 'react';
import { Order } from '@/types';
import { updateOrderStatus } from '@/lib/actions/orders';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидает', confirmed: 'Подтверждён', shipped: 'В доставке',
  delivered: 'Доставлен', cancelled: 'Отменён',
};
const STATUS_COLOR: Record<string, string> = {
  pending:   'text-amber-400  bg-amber-400/10  border-amber-400/20',
  confirmed: 'text-blue-400   bg-blue-400/10   border-blue-400/20',
  shipped:   'text-violet-400 bg-violet-400/10 border-violet-400/20',
  delivered: 'text-brand-green bg-brand-green/10 border-brand-green/20',
  cancelled: 'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function AdminOrdersTable({ orders: initialOrders }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [, startTransition] = useTransition();

  const handleStatus = (id: string, status: Order['status']) => {
    startTransition(async () => {
      const res = await updateOrderStatus(id, status);
      if (!res.error) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      }
    });
  };

  if (orders.length === 0) {
    return <div className="py-12 text-center text-gray-500">Заказов ещё нет</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border">
            {['ID', 'Покупатель', 'Сумма', 'Дата', 'Статус', 'Действие'].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {orders.map(order => (
            <tr key={order.id} className="hover:bg-dark-surface/40 transition-colors">
              <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-6 py-4">
                <p className="text-white font-medium">{(order as any).buyer?.full_name ?? 'Аноним'}</p>
                <p className="text-xs text-gray-500">{(order as any).buyer?.phone}</p>
              </td>
              <td className="px-6 py-4 font-bold text-white">{formatPrice(order.total_price)}</td>
              <td className="px-6 py-4 text-gray-400 text-xs">
                {new Date(order.created_at).toLocaleDateString('ru-RU')}
              </td>
              <td className="px-6 py-4">
                <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', STATUS_COLOR[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
              </td>
              <td className="px-6 py-4">
                <select
                  value={order.status}
                  onChange={e => handleStatus(order.id, e.target.value as Order['status'])}
                  className="px-3 py-1.5 rounded-lg bg-dark-surface border border-dark-border text-white text-xs outline-none focus:border-brand-blue transition-colors"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
