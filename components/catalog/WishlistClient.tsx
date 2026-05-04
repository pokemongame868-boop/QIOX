'use client';
// components/catalog/WishlistClient.tsx

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Heart, Star, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { removeFromWishlist } from '@/lib/actions/wishlist';
import AddToCartButton from '@/components/ui/AddToCartButton';
import ProductImage from '@/components/ui/ProductImage';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useToast } from '@/lib/hooks/useToast';

export default function WishlistClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts]    = useState(initialProducts);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, startTransition]         = useTransition();
  const { success, error: toastError } = useToast();

  const handleRemove = (productId: string) => {
    // Optimistic remove
    setRemovingId(productId);
    const prev = [...products];
    setProducts(p => p.filter(item => item.id !== productId));

    startTransition(async () => {
      const res = await removeFromWishlist(productId);
      if (res.error) {
        setProducts(prev); // revert
        toastError('Ошибка', res.error);
      } else {
        success('Удалено из избранного');
      }
      setRemovingId(null);
    });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <Heart className="w-16 h-16 text-gray-700 mb-4" />
        <h2 className="font-display text-2xl font-bold text-white mb-2">Список пуст</h2>
        <p className="text-gray-500 mb-8">Все товары удалены из избранного</p>
        <Link href="/catalog" className="btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(product => {
        const thumb    = product.images?.[0];
        const discount = product.old_price ? calculateDiscount(product.price, product.old_price) : null;
        const inStock  = (product.stock_qty ?? 0) > 0;
        const isRemoving = removingId === product.id;

        return (
          <div
            key={product.id}
            className={`bg-dark-card border border-dark-border rounded-2xl overflow-hidden transition-all duration-300 ${
              isRemoving ? 'opacity-40 scale-95' : 'hover:border-brand-blue/40 hover:shadow-card-hover'
            }`}
          >
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-dark-surface">
              {thumb ? (
                <ProductImage src={thumb} alt={product.name} fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CategoryIcon slug={product.category_slug} className="w-16 h-16 text-gray-600" />
                </div>
              )}
              {discount && (
                <span className="absolute top-3 left-3 badge bg-orange-500 text-white">-{discount}%</span>
              )}
            </Link>

            <div className="p-4 space-y-3">
              <div>
                <p className="text-[11px] text-brand-blue-light font-bold uppercase tracking-wider mb-1">
                  {product.brand}
                </p>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-gray-200">
                    {product.name}
                  </h3>
                </Link>
              </div>

              {product.review_count > 0 && (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700'}`} />
                  ))}
                  <span className="text-[11px] text-gray-500 ml-1">({product.review_count})</span>
                </div>
              )}

              <div className="flex items-end justify-between">
                <div>
                  <p className="font-display text-lg font-bold text-white">{formatPrice(product.price)}</p>
                  {product.old_price && (
                    <p className="text-xs text-gray-600 line-through">{formatPrice(product.old_price)}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={isRemoving}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                  title="Удалить из избранного"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <AddToCartButton productId={product.id} inStock={inStock} size="sm" className="w-full justify-center" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
