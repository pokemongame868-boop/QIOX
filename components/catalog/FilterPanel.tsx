'use client';
// components/catalog/FilterPanel.tsx
// Reads filter options from Supabase (brands, price range, specs per category)

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { SpecTemplate } from '@/types';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

export interface FilterOptions {
  brands:         string[];
  price_range:    { min: number; max: number };
  spec_templates: SpecTemplate[];
}

interface Props {
  options:     FilterOptions;
  categorySlug?: string;
}

// ── Collapsible filter section ────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-dark-border py-4 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-white mb-3">
        {title}
        <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

// ── Checkbox option ───────────────────────────────────────
function CheckOption({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={cn(
        'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all',
        checked
          ? 'bg-brand-blue border-brand-blue'
          : 'border-dark-border group-hover:border-gray-500'
      )}>
        {checked && <span className="text-white text-[10px]">✓</span>}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className={cn('text-sm transition-colors', checked ? 'text-white' : 'text-gray-400 group-hover:text-gray-200')}>
        {label}
      </span>
    </label>
  );
}

export default function FilterPanel({ options, categorySlug }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // ── Local state from URL params ───────────────────────
  const [brands,   setBrands]   = useState<string[]>(
    searchParams.get('brand')?.split(',').filter(Boolean) ?? []
  );
  const [minPrice, setMinPrice] = useState(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : options.price_range?.min ?? 0
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : options.price_range?.max ?? 9999999
  );
  const [inStock,  setInStock]  = useState(searchParams.get('inStock') === 'true');
  const [specs,    setSpecs]    = useState<Record<string, string>>(() => {
    const s: Record<string,string> = {};
    options.spec_templates?.forEach(t => {
      const v = searchParams.get(`spec_${t.key}`);
      if (v) s[t.key] = v;
    });
    return s;
  });

  // ── Apply filters → update URL ────────────────────────
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset page on filter change
    params.delete('page');

    if (brands.length > 0) params.set('brand', brands.join(','));
    else params.delete('brand');

    if (minPrice > (options.price_range?.min ?? 0)) params.set('minPrice', String(minPrice));
    else params.delete('minPrice');

    if (maxPrice < (options.price_range?.max ?? 9999999)) params.set('maxPrice', String(maxPrice));
    else params.delete('maxPrice');

    if (inStock) params.set('inStock', 'true');
    else params.delete('inStock');

    // Spec filters
    options.spec_templates?.forEach(t => {
      if (specs[t.key]) params.set(`spec_${t.key}`, specs[t.key]);
      else params.delete(`spec_${t.key}`);
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // ── Reset all ─────────────────────────────────────────
  const resetAll = () => {
    setBrands([]);
    setMinPrice(options.price_range?.min ?? 0);
    setMaxPrice(options.price_range?.max ?? 9999999);
    setInStock(false);
    setSpecs({});
    const params = new URLSearchParams();
    if (categorySlug) params.set('category', categorySlug);
    router.push(`${pathname}?${params.toString()}`);
  };

  const activeFilterCount =
    brands.length +
    (inStock ? 1 : 0) +
    Object.values(specs).filter(Boolean).length +
    (minPrice > (options.price_range?.min ?? 0) ? 1 : 0) +
    (maxPrice < (options.price_range?.max ?? 9999999) ? 1 : 0);

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-blue-light" />
          Фильтры
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-blue text-white text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={resetAll} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Сбросить
          </button>
        )}
      </div>

      <div className="px-5">
        {/* In stock */}
        <FilterSection title="Наличие">
          <CheckOption label="Только в наличии" checked={inStock} onChange={() => setInStock(!inStock)} />
        </FilterSection>

        {/* Price range */}
        <FilterSection title="Цена">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] text-gray-600 mb-1 block">От</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(Number(e.target.value))}
                  min={options.price_range?.min}
                  max={maxPrice}
                  className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm outline-none focus:border-brand-blue transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-gray-600 mb-1 block">До</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  min={minPrice}
                  max={options.price_range?.max}
                  className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatPrice(options.price_range?.min ?? 0)}</span>
              <span>{formatPrice(options.price_range?.max ?? 9999999)}</span>
            </div>
          </div>
        </FilterSection>

        {/* Brands */}
        {options.brands && options.brands.length > 0 && (
          <FilterSection title="Бренд">
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {options.brands.map(brand => (
                <CheckOption key={brand} label={brand}
                  checked={brands.includes(brand)}
                  onChange={() => setBrands(prev =>
                    prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                  )}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Dynamic spec filters */}
        {options.spec_templates?.filter(t => t.data_type !== 'number').map(tmpl => (
          <FilterSection key={tmpl.key} title={tmpl.label} defaultOpen={false}>
            {tmpl.data_type === 'enum' && tmpl.options ? (
              tmpl.options.map(opt => (
                <CheckOption key={opt} label={opt}
                  checked={specs[tmpl.key] === opt}
                  onChange={() => setSpecs(prev =>
                    prev[tmpl.key] === opt ? { ...prev, [tmpl.key]: '' } : { ...prev, [tmpl.key]: opt }
                  )}
                />
              ))
            ) : (
              <input
                type="text"
                value={specs[tmpl.key] ?? ''}
                onChange={e => setSpecs(prev => ({ ...prev, [tmpl.key]: e.target.value }))}
                placeholder={`Поиск по ${tmpl.label.toLowerCase()}...`}
                className="w-full px-3 py-2 rounded-lg bg-dark-surface border border-dark-border text-white text-sm outline-none focus:border-brand-blue transition-colors placeholder-gray-600"
              />
            )}
          </FilterSection>
        ))}
      </div>

      {/* Apply button */}
      <div className="px-5 py-4 border-t border-dark-border">
        <button onClick={applyFilters}
          className="w-full py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-light text-white font-semibold text-sm transition-all hover:shadow-blue-glow">
          Применить фильтры
        </button>
      </div>
    </div>
  );
}
