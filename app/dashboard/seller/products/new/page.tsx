// app/dashboard/seller/products/new/page.tsx
import { createClient } from '@/lib/supabase/server';
import HeaderWrapper from '@/components/layout/HeaderWrapper';
import ProductForm from '@/components/seller/ProductForm';

export const metadata = { title: 'Добавить товар — QIOX' };

export default async function NewProductPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <HeaderWrapper />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Добавить товар</h1>
        <ProductForm categories={categories ?? []} />
      </main>
    </div>
  );
}
