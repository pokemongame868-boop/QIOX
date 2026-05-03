// components/home/HeroSearch.tsx
import SearchBar from '@/components/ui/SearchBar';

export default function HeroSearch() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <SearchBar size="lg" className="w-full" />
      <p className="mt-3 text-center text-xs text-gray-600">
        Автодополнение · Поиск по названию и бренду
      </p>
    </div>
  );
}
