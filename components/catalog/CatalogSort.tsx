'use client';
// components/catalog/CatalogSort.tsx

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Новинки'   },
  { value: 'popular',    label: 'Популярные' },
  { value: 'rating',     label: 'По рейтингу'},
  { value: 'price_asc',  label: 'Дешевле'   },
  { value: 'price_desc', label: 'Дороже'    },
];

export default function CatalogSort({ current = 'newest' }: { current?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-600 mr-1 hidden sm:block">Сортировка:</span>
      <div className="flex gap-1 p-1 bg-dark-surface border border-dark-border rounded-xl overflow-x-auto">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              current === opt.value
                ? 'bg-brand-blue text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
