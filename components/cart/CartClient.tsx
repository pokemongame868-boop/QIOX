'use client';
// components/cart/CartClient.tsx

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, Package } from 'lucide-react';
import { CartItem } from '@/types';
import { updateCartQuantity, removeFromCart } from '@/lib/actions/cart';
import { formatPrice } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';

interface Props { initialItems: CartItem[]; }

export default function CartClient({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + (i.line_total ?? (i.price ?? 0) * i.quantity), 0);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleQty = (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove(item.id);

    setLoadingId(item.id);
    startTransition(async () => {
      const res = await updateCartQuantity(item.id, newQty);
      if (!res.error) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty, line_total: (i.price ?? 0) * newQty } : i));
      }
      setLoadingId(null);
    });
  };

  const handleRemove = (id: string) => {
    setLoadingId(id);
    startTransition(async () => {
      await removeFromCart(id);
      setItems(prev => prev.filter(i => i.id !== id));
      setLoadingId(null);
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Корзина пуста</h2>
        <p className="text-gray-500 mb-8">Добавьте товары, чтобы оформить заказ</p>
        <Link href="/" className="btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Items list */}
      <div className="lg:col-span-2 space-y-3">
        {items.map(item => (
          <div key={item.id} className={`bg-dark-card border border-dark-border rounded-2xl p-4 flex gap-4 transition-opacity ${loadingId === item.id ? 'opacity-50' : ''}`}>
            {/* Image */}
            <div className="w-20 h-20 rounded-xl bg-dark-surface flex items-center justify-center flex-shrink-0 text-3xl">
              {item.images?.[0]
                ? <ProductImage src={item.images[0]} alt={item.product_name ?? ''} width={80} height={80} className="rounded-xl object-cover w-full h-full" />
                : <Package className="w-8 h-8 text-gray-600" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-brand-blue-light font-semibold mb-1">{item.brand}</p>
              <Link href={`/product/${item.product_id}`} className="text-sm font-semibold text-white hover:text-gray-200 line-clamp-2 leading-snug">
                {item.product_name}
              </Link>
              <p className="text-base font-bold text-white mt-2 font-display">
                {formatPrice(item.price ?? 0)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-end justify-between gap-2">
              <button
                onClick={() => handleRemove(item.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-dark-surface border border-dark-border rounded-xl p-1">
                <button onClick={() => handleQty(item, -1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-card transition-all">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">
                  {loadingId === item.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
                </span>
                <button onClick={() => handleQty(item, 1)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-dark-card transition-all">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm font-bold text-white">
                {formatPrice(item.line_total ?? (item.price ?? 0) * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-20">
          <h2 className="font-display text-lg font-bold text-white mb-4">Итого</h2>

          <div className="space-y-3 pb-4 border-b border-dark-border text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Товары ({totalItems} шт.)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Доставка</span>
              <span className="text-brand-green">Бесплатно</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 mb-6">
            <span className="font-bold text-white">К оплате</span>
            <span className="font-display text-2xl font-bold text-white">{formatPrice(total)}</span>
          </div>

          <Link
            href="/cart/checkout"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-blue hover:bg-brand-blue-light font-bold text-white transition-all hover:shadow-blue-glow"
          >
            Оформить заказ
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link href="/" className="w-full flex items-center justify-center mt-3 py-3 text-sm text-gray-500 hover:text-white transition-colors">
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
