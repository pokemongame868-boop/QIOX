'use client';
// components/seller/SellerProductTable.tsx

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { deleteProduct } from '@/lib/actions/products';
import { formatPrice } from '@/lib/utils';
import { Edit2, Trash2, Eye, Loader2, Package, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<string, string> = {
  active:   'text-brand-green  bg-brand-green/10  border-brand-green/20',
  draft:    'text-amber-400   bg-amber-400/10   border-amber-400/20',
  archived: 'text-gray-500   bg-gray-500/10   border-gray-500/20',
};
const STATUS_LABEL: Record<string, string> = {
  active: 'Активен', draft: 'Черновик', archived: 'Архив',
};

export default function SellerProductTable({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm('Удалить товар?')) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (!res.error) setItems(prev => prev.filter(p => p.id !== id));
      setDeletingId(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <Package className="w-12 h-12 text-gray-700 mb-3" />
        <p className="text-gray-400 mb-4">У вас пока нет товаров</p>
        <Link href="/dashboard/seller/products/new" className="btn-primary text-sm">
          Добавить первый товар
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-border">
            {['Товар', 'Цена', 'Склад', 'Статус', 'Рейтинг', ''].map(h => (
              <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-dark-border">
          {items.map(product => (
            <tr key={product.id} className={cn('hover:bg-dark-surface/50 transition-colors', deletingId === product.id && 'opacity-40')}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-surface flex items-center justify-center text-xl flex-shrink-0">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                      : <Package className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate max-w-[200px]">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand} · {product.sku}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-white">{formatPrice(product.price)}</p>
                {product.old_price && (
                  <p className="text-xs text-gray-600 line-through">{formatPrice(product.old_price)}</p>
                )}
              </td>
              <td className="px-6 py-4">
                <span className={cn('font-semibold', product.stock_qty === 0 ? 'text-red-400' : product.stock_qty < 5 ? 'text-amber-400' : 'text-white')}>
                  {product.stock_qty} шт.
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={cn('text-xs px-2.5 py-1 rounded-full border font-medium', STATUS_STYLE[product.status])}>
                  {STATUS_LABEL[product.status]}
                </span>
              </td>
              <td className="px-6 py-4 text-amber-400 font-medium">
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {product.rating} <span className="text-gray-600 text-xs">({product.review_count})</span>
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 justify-end">
                  <Link href={`/product/${product.slug}`} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-dark-surface transition-all">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/dashboard/seller/products/${product.id}/edit`} className="p-2 text-gray-500 hover:text-brand-blue-light rounded-lg hover:bg-dark-surface transition-all">
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(product.id)} disabled={!!deletingId} className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-dark-surface transition-all">
                    {deletingId === product.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
