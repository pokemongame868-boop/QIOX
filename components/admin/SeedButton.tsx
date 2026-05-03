'use client';
// components/admin/SeedButton.tsx

import { useState, useTransition } from 'react';
import { seedProducts } from '@/lib/actions/products';
import { Loader2, CheckCircle } from 'lucide-react';

export default function SeedButton() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const handle = () => {
    start(async () => {
      const res = await seedProducts();
      if (res.error) setError(res.error);
      else setDone(true);
    });
  };

  if (done) return (
    <div className="flex flex-col items-center gap-3">
      <CheckCircle className="w-12 h-12 text-brand-green" />
      <p className="text-brand-green font-semibold">Данные загружены успешно!</p>
      <a href="/" className="btn-primary mt-2">На главную</a>
    </div>
  );

  return (
    <div className="space-y-3">
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={handle} disabled={pending}
        className="btn-primary flex items-center gap-2 mx-auto disabled:opacity-60">
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}
        {pending ? 'Загружаем...' : '🌱 Загрузить тестовые данные'}
      </button>
    </div>
  );
}
