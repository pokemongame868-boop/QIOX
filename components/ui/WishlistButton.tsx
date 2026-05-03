'use client';
// components/ui/WishlistButton.tsx
// Optimistic UI: toggles instantly, reverts on error

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '@/lib/actions/wishlist';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';

interface Props {
  productId:     string;
  initialState?: boolean;  // whether already wishlisted
  size?:         'sm' | 'md' | 'lg';
  className?:    string;
  showLabel?:    boolean;
}

export default function WishlistButton({
  productId, initialState = false, size = 'md', className, showLabel = false,
}: Props) {
  const [wishlisted, setWishlisted] = useState(initialState);
  const [pending, startTransition]  = useTransition();
  const { success, error: toastError, info } = useToast();

  const handleToggle = () => {
    // Optimistic update
    const prev = wishlisted;
    setWishlisted(!prev);

    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (res.error) {
        setWishlisted(prev); // revert
        if (res.error === 'Войдите в аккаунт') {
          info('Войдите в аккаунт', 'Чтобы добавить в избранное');
        } else {
          toastError('Ошибка', res.error);
        }
      } else {
        if (res.data) {
          success('Добавлено в избранное', 'Товар сохранён в вашем списке');
        } else {
          info('Удалено из избранного');
        }
      }
    });
  };

  const sizeStyles = {
    sm:  'p-1.5 rounded-lg',
    md:  'p-2   rounded-xl',
    lg:  'flex items-center gap-2 px-4 py-3 rounded-xl',
  };

  const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-4 h-4' };

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-label={wishlisted ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={cn(
        'transition-all duration-200 border',
        sizeStyles[size],
        wishlisted
          ? 'text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20'
          : 'text-gray-500 border-dark-border hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5',
        pending && 'opacity-60 cursor-wait',
        className
      )}
    >
      <Heart className={cn(iconSize[size], wishlisted && 'fill-current')} />
      {showLabel && size === 'lg' && (
        <span className="text-sm font-medium">
          {wishlisted ? 'В избранном' : 'В избранное'}
        </span>
      )}
    </button>
  );
}
