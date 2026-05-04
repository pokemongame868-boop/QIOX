'use client';
// components/ui/ProductCard.tsx  (v2 — real Supabase data)

import Link from 'next/link';
import { Star, Zap } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice, calculateDiscount, cn } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';
import WishlistButton  from './WishlistButton';
import ProductImage from './ProductImage';
import CategoryIcon from './CategoryIcon';

interface Props {
  product:     Product;
  wishlisted?: boolean;
  className?:  string;
}

export default function ProductCard({ product, wishlisted = false, className }: Props) {
  const discount = product.old_price
    ? calculateDiscount(product.price, product.old_price) : null;

  const thumb = product.images?.[0];
  const inStock = (product.stock_qty ?? 0) > 0;

  return (
    <div className={cn('product-card group relative', className)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-dark-surface overflow-hidden">
          {thumb ? (
            <ProductImage
              src={thumb} alt={product.name} fill
              sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center select-none group-hover:scale-110 transition-transform duration-300">
              <CategoryIcon slug={product.category_slug} className="w-20 h-20 text-gray-600" />
            </div>
          )}

          <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <span className="badge bg-brand-blue text-white flex items-center gap-1">
                <Zap className="w-3 h-3" />NEW
              </span>
            )}
            {discount && <span className="badge bg-orange-500 text-white">-{discount}%</span>}
            {!inStock && (
              <span className="badge bg-dark-card border border-dark-border text-gray-500">Нет в наличии</span>
            )}
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton productId={product.id} initialState={wishlisted} size="sm" />
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-2.5">
        <p className="text-[11px] text-brand-blue-light font-bold uppercase tracking-wider">
          {product.brand}
        </p>
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 hover:text-gray-100">
            {product.name}
          </h3>
        </Link>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-3 h-3', i < Math.round(product.rating)
                  ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700')} />
              ))}
            </div>
            <span className="text-[11px] text-gray-500">({product.review_count})</span>
          </div>
        )}

        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-base md:text-lg font-bold text-white font-display">
              {formatPrice(product.price)}
            </p>
            {product.old_price && (
              <p className="text-xs text-gray-600 line-through">{formatPrice(product.old_price)}</p>
            )}
          </div>
          <AddToCartButton productId={product.id} inStock={inStock} size="sm" showLabel={false} />
        </div>
      </div>
    </div>
  );
}
