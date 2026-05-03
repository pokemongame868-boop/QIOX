'use client';
// components/ui/SearchBar.tsx
// Debounced search with autocomplete, used in Header and Catalog

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, TrendingUp, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string; name: string; brand: string;
  slug: string; price: number; category_slug: string;
}

const TRENDING = ['iPhone 16 Pro', 'MacBook M4', 'Samsung S25', 'Sony WH-1000XM6'];

interface Props {
  initialValue?: string;
  className?:    string;
  onSearch?:     (q: string) => void; // for catalog inline search
  size?:         'sm' | 'lg';
}

export default function SearchBar({ initialValue = '', className, onSearch, size = 'sm' }: Props) {
  const [query,       setQuery]      = useState(initialValue);
  const [suggestions, setSuggestions]= useState<Suggestion[]>([]);
  const [loading,     setLoading]    = useState(false);
  const [focused,     setFocused]    = useState(false);
  const [selected,    setSelected]   = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef    = useRef<HTMLInputElement>(null);
  const router      = useRouter();
  const supabase    = createClient();

  // ── Debounced autocomplete ────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const { data } = await supabase.rpc('search_products_autocomplete', {
        p_query: q.trim(), p_limit: 8,
      });
      setSuggestions((data ?? []) as Suggestion[]);
    } catch {}
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 320);
    } else {
      setSuggestions([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  // ── Navigation ────────────────────────────────────────────
  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSuggestions([]);
    setFocused(false);
    inputRef.current?.blur();
    if (onSearch) {
      onSearch(trimmed); // catalog mode: update filters
    } else {
      router.push(`/catalog?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setSuggestions([]);
    setFocused(false);
    router.push(`/product/${s.slug}`);
  };

  // ── Keyboard navigation ───────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { setSelected(p => Math.min(p + 1, suggestions.length - 1)); e.preventDefault(); }
    if (e.key === 'ArrowUp')   { setSelected(p => Math.max(p - 1, -1)); e.preventDefault(); }
    if (e.key === 'Enter') {
      if (selected >= 0 && suggestions[selected]) handleSelect(suggestions[selected]);
      else handleSearch(query);
    }
    if (e.key === 'Escape') { setFocused(false); setSuggestions([]); inputRef.current?.blur(); }
  };

  const showDropdown = focused && (suggestions.length > 0 || query.length < 2);

  return (
    <div className={cn('relative', className)}>
      {/* Input */}
      <div className={cn(
        'flex items-center gap-2 rounded-xl border transition-all duration-200',
        size === 'lg' ? 'px-5 py-4' : 'px-4 py-2.5',
        focused
          ? 'bg-dark-surface border-brand-blue shadow-blue-glow'
          : 'bg-dark-surface border-dark-border hover:border-gray-600'
      )}>
        {loading
          ? <Loader2 className="w-4 h-4 text-brand-blue-light animate-spin flex-shrink-0" />
          : <Search className={cn('w-4 h-4 flex-shrink-0', focused ? 'text-brand-blue-light' : 'text-gray-500')} />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(-1); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          onKeyDown={handleKeyDown}
          placeholder={size === 'lg' ? 'Поиск смартфонов, ноутбуков, техники...' : 'Поиск товаров...'}
          className={cn(
            'w-full bg-transparent text-white placeholder-gray-500 outline-none',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions([]); onSearch?.(''); }}
            className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
        {size === 'lg' && (
          <button
            onClick={() => handleSearch(query)}
            className={cn(
              'flex-shrink-0 px-5 py-2 rounded-xl font-semibold text-sm transition-all',
              query.length > 0
                ? 'bg-brand-blue hover:bg-brand-blue-light text-white hover:shadow-blue-glow'
                : 'bg-dark-card text-gray-500'
            )}
          >
            Найти
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-dark-surface border border-dark-border rounded-2xl overflow-hidden shadow-card z-50 animate-slide-in">
          {suggestions.length > 0 ? (
            <>
              <div className="px-4 pt-3 pb-1">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Результаты</p>
              </div>
              {suggestions.map((s, i) => (
                <button key={s.id} onMouseDown={() => handleSelect(s)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                    selected === i ? 'bg-dark-muted' : 'hover:bg-dark-muted'
                  )}>
                  <Search className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.brand}</p>
                  </div>
                  <span className="text-xs font-bold text-white flex-shrink-0">
                    {formatPrice(s.price)}
                  </span>
                </button>
              ))}
              <div className="border-t border-dark-border px-4 py-2.5">
                <button onMouseDown={() => handleSearch(query)}
                  className="text-xs text-brand-blue-light hover:text-white transition-colors">
                  Показать все результаты для «{query}» →
                </button>
              </div>
            </>
          ) : (
            // Trending when no query
            <div className="py-3">
              <div className="px-4 pb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-green" />
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Популярно</p>
              </div>
              {TRENDING.map(term => (
                <button key={term} onMouseDown={() => { setQuery(term); handleSearch(term); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-muted text-left transition-colors">
                  <Search className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-sm text-gray-300">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
