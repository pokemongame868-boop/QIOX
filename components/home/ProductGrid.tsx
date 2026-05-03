// components/home/ProductGrid.tsx
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';

interface Props {
  products: Product[];
  title?: string;
  subtitle?: string;
  wishlistIds?: string[];
}

export default function ProductGrid({ products, title = 'Рекомендуем', subtitle = 'Лучшие товары', wishlistIds = [] }: Props) {
  if (products.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <Link href="/catalog" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-blue-light hover:text-white font-medium">
          Смотреть все <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} wishlisted={wishlistIds.includes(p.id)} />)}
      </div>
    </section>
  );
}
