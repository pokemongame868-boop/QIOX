'use client';
// components/ui/AddToCartButton.tsx

import { useState, useTransition } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { addToCart } from '@/lib/actions/cart';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  inStock:   boolean;
  quantity?: number;
  size?:     'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export default function AddToCartButton({
  productId, inStock, quantity = 1, size = 'md', className, showLabel = true,
}: Props) {
  const [added, setAdded]          = useState(false);
  const [pending, startTransition] = useTransition();
  const { success, error: toastError, info } = useToast();

  const handleAdd = () => {
    startTransition(async () => {
      const res = await addToCart(productId, quantity);
      if (res.error) {
        if (res.error === 'Войдите в аккаунт') {
          info('Войдите в аккаунт', 'Чтобы добавить товар в корзину');
        } else {
          toastError('Ошибка', res.error);
        }
      } else {
        setAdded(true);
        success('Добавлено в корзину', 'Товар успешно добавлен');
        setTimeout(() => setAdded(false), 2000);
      }
    });
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (!inStock) {
    return (
      <button disabled className={cn(
        'flex items-center gap-2 rounded-xl font-semibold text-sm',
        'bg-dark-card border border-dark-border text-gray-600 cursor-not-allowed',
        size === 'sm' ? 'px-3 py-2' : size === 'lg' ? 'w-full py-4 justify-center' : 'px-4 py-2.5',
        className
      )}>
        <ShoppingCart className={iconSize} />
        {showLabel && 'Нет в наличии'}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={pending || added}
      className={cn(
        'flex items-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200',
        size === 'sm' ? 'px-3 py-2' : size === 'lg' ? 'w-full py-4 justify-center' : 'px-4 py-2.5',
        added
          ? 'bg-brand-green text-dark-bg shadow-green-glow'
          : pending
          ? 'bg-brand-blue/70 text-white cursor-wait'
          : 'bg-brand-blue hover:bg-brand-blue-light text-white hover:shadow-blue-glow active:scale-[0.98]',
        className
      )}
    >
      {pending
        ? <Loader2 className={cn(iconSize, 'animate-spin')} />
        : added
        ? <Check className={iconSize} />
        : <ShoppingCart className={iconSize} />}
      {showLabel && (pending ? 'Добавляем...' : added ? 'Добавлено!' : 'В корзину')}
    </button>
  );
}
