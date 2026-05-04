'use client';
// components/product/ImageGallery.tsx

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductImage from '@/components/ui/ProductImage';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface Props {
  images:       string[];
  productName:  string;
  categorySlug?: string;
}

export default function ImageGallery({ images, productName, categorySlug }: Props) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const hasImages = images && images.length > 0;

  const prev = () => setActive(p => (p - 1 + images.length) % images.length);
  const next = () => setActive(p => (p + 1) % images.length);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative aspect-square bg-dark-surface rounded-2xl border border-dark-border overflow-hidden group cursor-zoom-in"
        onClick={() => hasImages && setZoomed(true)}
      >
        {hasImages ? (
          <>
            <ProductImage
              key={active}
              src={images[active]}
              alt={`${productName} — фото ${active + 1}`}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-500 group-hover:scale-105"
            />
            {/* Zoom hint */}
            <div className="absolute bottom-3 right-3 p-2 bg-dark-bg/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CategoryIcon slug={categorySlug} className="w-32 h-32 text-gray-600" />
          </div>
        )}

        {/* Navigation arrows (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-dark-bg/70 border border-dark-border text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark-surface">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={e => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-dark-bg/70 border border-dark-border text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark-surface">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all',
                active === i
                  ? 'border-brand-blue shadow-blue-glow'
                  : 'border-dark-border hover:border-gray-500'
              )}
            >
              <ProductImage src={src} alt={`thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && hasImages && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <div className="relative max-w-4xl w-full aspect-square" onClick={e => e.stopPropagation()}>
            <ProductImage
              src={images[active]}
              alt={productName}
              fill
              className="object-contain"
              sizes="90vw"
            />
            <button onClick={() => setZoomed(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-dark-bg/80 border border-dark-border text-white flex items-center justify-center hover:bg-dark-surface transition-colors">
              ✕
            </button>
            {images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-dark-bg/80 border border-dark-border text-white flex items-center justify-center hover:bg-dark-surface">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={e => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-dark-bg/80 border border-dark-border text-white flex items-center justify-center hover:bg-dark-surface">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
