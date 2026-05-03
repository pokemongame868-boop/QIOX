'use client';
// components/seller/ProductForm.tsx

import { useFormState, useFormStatus } from 'react-dom';
import { createProduct } from '@/lib/actions/products';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SpecTemplate } from '@/types';
import { Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category { id: string; name: string; slug: string; }

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="btn-primary flex items-center gap-2 disabled:opacity-60">
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Сохраняем...' : 'Опубликовать товар'}
    </button>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 text-sm outline-none focus:border-brand-blue transition-colors';
const labelCls = 'block text-sm font-medium text-gray-300 mb-1.5';

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [state, action] = useFormState(createProduct, {});
  const [categoryId, setCategoryId] = useState('');
  const [specs, setSpecs]           = useState<Record<string, string>>({});
  const [specTemplates, setSpecTemplates] = useState<SpecTemplate[]>([]);
  const [images, setImages]         = useState<string[]>(['']);
  const [status, setStatus]         = useState<'draft' | 'active'>('active');

  // Load spec templates when category changes
  useEffect(() => {
    if (!categoryId) { setSpecTemplates([]); return; }
    const supabase = createClient();
    supabase
      .from('spec_templates')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order')
      .then(({ data }) => {
        setSpecTemplates(data ?? []);
        setSpecs({});
      });
  }, [categoryId]);

  const addImageField = () => setImages(prev => [...prev, '']);
  const removeImage   = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));
  const updateImage   = (i: number, v: string) => setImages(prev => prev.map((img, idx) => idx === i ? v : img));

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="specs"  value={JSON.stringify(specs)} />
      <input type="hidden" name="status" value={status} />
      {images.map((img, i) => (
        <input key={i} type="hidden" name="images" value={img} />
      ))}

      {state.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-white">Основная информация</h2>

        <div>
          <label className={labelCls}>Название товара *</label>
          <input type="text" name="name" required placeholder="Apple iPhone 16 Pro Max 256GB" className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Категория *</label>
            <select
              name="category_id" required
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className={inputCls}
            >
              <option value="">Выберите категорию</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Бренд</label>
            <input type="text" name="brand" placeholder="Apple" className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Описание</label>
          <textarea name="description" rows={4} placeholder="Подробное описание товара..." className={cn(inputCls, 'resize-none')} />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-white">Цена и склад</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Цена (₸) *</label>
            <input type="number" name="price" required min="0" placeholder="189990" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Старая цена (₸)</label>
            <input type="number" name="old_price" min="0" placeholder="219990" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Остаток (шт.)</label>
            <input type="number" name="stock_qty" min="0" defaultValue="10" className={inputCls} />
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex gap-3 pt-1">
          {(['active', 'draft'] as const).map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={cn('flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all', status === s
                ? 'border-brand-blue bg-brand-blue/10 text-white'
                : 'border-dark-border text-gray-500 hover:border-gray-600')}>
              {s === 'active' ? '✓ Опубликовать сразу' : '◷ Сохранить черновик'}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-white">Изображения</h2>
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={img}
                onChange={e => updateImage(i, e.target.value)}
                placeholder={`URL изображения ${i + 1}`}
                className={cn(inputCls, 'flex-1')}
              />
              {images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)}
                  className="p-3 text-gray-500 hover:text-red-400 rounded-xl border border-dark-border hover:border-red-500/30 transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {images.length < 5 && (
          <button type="button" onClick={addImageField}
            className="flex items-center gap-2 text-sm text-brand-blue-light hover:text-white transition-colors">
            <Plus className="w-4 h-4" /> Добавить изображение
          </button>
        )}
      </div>

      {/* Dynamic Specs */}
      {specTemplates.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display font-bold text-white">Характеристики</h2>
          <div className="grid grid-cols-2 gap-4">
            {specTemplates.map(tmpl => (
              <div key={tmpl.key}>
                <label className={labelCls}>
                  {tmpl.label}
                  {tmpl.unit && <span className="text-gray-600 ml-1">({tmpl.unit})</span>}
                  {tmpl.is_required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {tmpl.data_type === 'enum' && tmpl.options ? (
                  <select
                    value={specs[tmpl.key] ?? ''}
                    onChange={e => setSpecs(p => ({ ...p, [tmpl.key]: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Выберите...</option>
                    {tmpl.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : tmpl.data_type === 'boolean' ? (
                  <div className="flex gap-2">
                    {['Да', 'Нет'].map(v => (
                      <button key={v} type="button"
                        onClick={() => setSpecs(p => ({ ...p, [tmpl.key]: v }))}
                        className={cn('flex-1 py-2.5 rounded-xl border text-sm transition-all', specs[tmpl.key] === v
                          ? 'border-brand-blue bg-brand-blue/10 text-white'
                          : 'border-dark-border text-gray-500')}>
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type={tmpl.data_type === 'number' ? 'number' : 'text'}
                    value={specs[tmpl.key] ?? ''}
                    onChange={e => setSpecs(p => ({ ...p, [tmpl.key]: e.target.value }))}
                    placeholder={tmpl.unit ? `Например: 256 ${tmpl.unit}` : 'Введите значение'}
                    className={inputCls}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <SubmitButton />
        <a href="/dashboard/seller" className="btn-ghost">Отмена</a>
      </div>
    </form>
  );
}
