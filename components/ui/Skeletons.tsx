// components/ui/Skeletons.tsx
// Reusable skeleton placeholders for all loading states
import { cn } from '@/lib/utils';

// ── Base pulse ────────────────────────────────────────────
function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-dark-surface', className)} />
  );
}

// ── Product Card Skeleton ─────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      <Pulse className="aspect-square" />
      <div className="p-4 space-y-3">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-3 w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <Pulse className="h-5 w-24" />
          <Pulse className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Product Grid Skeleton ─────────────────────────────────
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Product Page Skeleton ─────────────────────────────────
export function ProductPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">
      {/* Image */}
      <div className="space-y-4">
        <Pulse className="aspect-square rounded-2xl" />
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(i => <Pulse key={i} className="w-16 h-16 rounded-xl" />)}
        </div>
      </div>
      {/* Info */}
      <div className="space-y-5">
        <Pulse className="h-4 w-20" />
        <Pulse className="h-8 w-full" />
        <Pulse className="h-6 w-3/4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => <Pulse key={i} className="w-5 h-5 rounded" />)}
          <Pulse className="h-4 w-24" />
        </div>
        <Pulse className="h-12 w-40" />
        <div className="space-y-3">
          <Pulse className="h-14 rounded-xl" />
          <Pulse className="h-14 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Review Skeleton ───────────────────────────────────────
export function ReviewSkeleton() {
  return (
    <div className="py-5 border-b border-dark-border last:border-0">
      <div className="flex items-center gap-3 mb-3">
        <Pulse className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <Pulse className="h-3.5 w-28" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>
      <Pulse className="h-3 w-full mb-2" />
      <Pulse className="h-3 w-4/5" />
    </div>
  );
}

// ── Catalog Filter Skeleton ───────────────────────────────
export function FilterSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-3">
          <Pulse className="h-4 w-24" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="flex items-center gap-2">
                <Pulse className="w-4 h-4 rounded" />
                <Pulse className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Wishlist Item Skeleton ────────────────────────────────
export function WishlistItemSkeleton() {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-4 flex gap-4">
      <Pulse className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3 w-16" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-24" />
      </div>
    </div>
  );
}

// ── Cart Skeleton ─────────────────────────────────────────
export function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-4 flex gap-4">
            <Pulse className="w-20 h-20 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-4 w-3/4" />
              <Pulse className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Pulse className="w-8 h-8 rounded-lg" />
              <Pulse className="w-20 h-8 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <Pulse className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

// ── Category Badge Skeleton ───────────────────────────────
export function CategoryBadgeSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Pulse key={i} className={`h-9 rounded-full ${i % 3 === 0 ? 'w-24' : i % 3 === 1 ? 'w-20' : 'w-28'}`} />
      ))}
    </div>
  );
}
