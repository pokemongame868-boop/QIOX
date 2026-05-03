'use client';
// components/catalog/CatalogPagination.tsx

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { current: number; total: number; }

export default function CatalogPagination({ current, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build visible page numbers with ellipsis
  const getPages = (): (number | '...')[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', current-1, current, current+1, '...', total];
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => goTo(current - 1)}
        disabled={current === 1}
        className="p-2.5 rounded-xl border border-dark-border text-gray-400 hover:text-white hover:border-brand-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-600">···</span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page as number)}
            className={cn(
              'w-10 h-10 rounded-xl text-sm font-medium transition-all border',
              current === page
                ? 'bg-brand-blue border-brand-blue text-white shadow-blue-glow'
                : 'border-dark-border text-gray-400 hover:text-white hover:border-brand-blue'
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goTo(current + 1)}
        disabled={current === total}
        className="p-2.5 rounded-xl border border-dark-border text-gray-400 hover:text-white hover:border-brand-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
