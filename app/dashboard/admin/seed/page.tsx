// app/dashboard/admin/seed/page.tsx
import SeedButton from '@/components/admin/SeedButton';
import Header from '@/components/layout/Header';
import { Sprout, TriangleAlert } from 'lucide-react';

export default function SeedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 w-full text-center">
        <div className="flex justify-center mb-6">
          <Sprout className="w-16 h-16 text-brand-green" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Загрузить тестовые данные</h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Добавит 9 товаров (iPhone, Samsung, MacBook, ASUS ROG, Lenovo, Dyson, Samsung Bespoke) от имени вашего аккаунта.
        </p>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-6">
          <p className="text-sm text-amber-400 mb-2 inline-flex items-center justify-center gap-2">
            <TriangleAlert className="w-4 h-4" />
            Только для разработки
          </p>
          <p className="text-xs text-gray-500">
            Функция вызывает хранимую процедуру <code className="text-gray-300">seed_products</code> в Supabase.
            Запустите после создания аккаунта администратора/продавца.
          </p>
        </div>
        <SeedButton />
      </main>
    </div>
  );
}
