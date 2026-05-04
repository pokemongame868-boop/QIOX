// components/home/Categories.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface CategoriesProps {
  categories: Category[];
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  smartphones: "from-blue-600/20 to-blue-900/10",
  laptops: "from-violet-600/20 to-violet-900/10",
  appliances: "from-emerald-600/20 to-emerald-900/10",
  headphones: "from-pink-600/20 to-pink-900/10",
  tablets: "from-amber-600/20 to-amber-900/10",
  gaming: "from-red-600/20 to-red-900/10",
};

const CATEGORY_BORDER: Record<string, string> = {
  smartphones: "hover:border-blue-500/50",
  laptops: "hover:border-violet-500/50",
  appliances: "hover:border-emerald-500/50",
  headphones: "hover:border-pink-500/50",
  tablets: "hover:border-amber-500/50",
  gaming: "hover:border-red-500/50",
};

export default function Categories({ categories }: CategoriesProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Категории
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Найдите нужную технику
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden sm:flex items-center gap-1.5 text-sm text-brand-blue-light hover:text-white transition-colors font-medium"
        >
          Все категории
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalog/${cat.slug}`}
            className={`
              group flex flex-col items-center gap-3 p-4 md:p-5 rounded-2xl
              bg-dark-card border border-dark-border
              ${CATEGORY_BORDER[cat.slug] || "hover:border-brand-blue/50"}
              transition-all duration-200 hover:-translate-y-0.5
              bg-gradient-to-br ${CATEGORY_GRADIENTS[cat.slug] || "from-gray-800/20 to-gray-900/10"}
            `}
          >
            {/* Icon */}
            <div className="group-hover:scale-110 transition-transform duration-200">
              <CategoryIcon slug={cat.slug} className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            {/* Label */}
            <div className="text-center">
              <p className="text-xs md:text-sm font-semibold text-white leading-tight">
                {cat.name}
              </p>
              {cat.product_count !== undefined && (
                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                  {cat.product_count} товаров
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile "All categories" link */}
      <div className="mt-4 sm:hidden text-center">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-sm text-brand-blue-light font-medium"
        >
          Все категории
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
