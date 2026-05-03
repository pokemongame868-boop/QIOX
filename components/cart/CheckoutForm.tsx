'use client';
// components/cart/CheckoutForm.tsx

import { useFormState, useFormStatus } from 'react-dom';
import { checkoutAction } from '@/lib/actions/orders';
import { CartItem, Profile } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Loader2, MapPin, CreditCard, Banknote } from 'lucide-react';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-blue hover:bg-brand-blue-light font-bold text-white transition-all hover:shadow-blue-glow disabled:opacity-60">
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Оформляем...' : 'Подтвердить заказ'}
    </button>
  );
}

interface Props { items: CartItem[]; total: number; profile: Profile | null; }

export default function CheckoutForm({ items, total, profile }: Props) {
  const [state, action] = useFormState(checkoutAction, {});
  const [payment, setPayment] = useState('cash');

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Address */}
      <div className="space-y-5">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-blue-light" /> Адрес доставки
          </h2>
          <div className="space-y-3">
            {[
              { name: 'city',   label: 'Город',   placeholder: 'Алматы', required: true },
              { name: 'street', label: 'Улица и дом', placeholder: 'ул. Абая, 1', required: true },
              { name: 'zip',    label: 'Индекс',   placeholder: '050000', required: false },
            ].map(f => (
              <div key={f.name}>
                <label className="text-sm text-gray-400 mb-1 block">{f.label}</label>
                <input
                  type="text" name={f.name} required={f.required}
                  placeholder={f.placeholder}
                  defaultValue={f.name === 'city' ? (profile?.address as any)?.city ?? '' : ''}
                  className="w-full px-4 py-3 rounded-xl bg-dark-surface border border-dark-border text-white placeholder-gray-600 text-sm outline-none focus:border-brand-blue transition-colors"
                />
              </div>
            ))}
            <input type="hidden" name="country" value="Казахстан" />
          </div>
        </div>

        {/* Payment */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-blue-light" /> Способ оплаты
          </h2>
          <input type="hidden" name="payment_method" value={payment} />
          <div className="space-y-2">
            {[
              { value: 'cash',   label: 'Наличными при получении', icon: Banknote },
              { value: 'card',   label: 'Картой при получении',    icon: CreditCard },
              { value: 'kaspi',  label: 'Kaspi Pay',               icon: CreditCard },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setPayment(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  payment === opt.value
                    ? 'border-brand-blue bg-brand-blue/10 text-white'
                    : 'border-dark-border text-gray-400 hover:border-gray-600'
                }`}>
                <opt.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Summary */}
      <div>
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 sticky top-20">
          <h2 className="font-display font-bold text-white mb-4">Ваш заказ</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 truncate mr-2">{item.product_name} ×{item.quantity}</span>
                <span className="text-white font-medium flex-shrink-0">{formatPrice(item.line_total ?? 0)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dark-border pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Доставка</span>
              <span className="text-brand-green font-medium text-sm">Бесплатно</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-bold text-white">Итого</span>
              <span className="font-display text-2xl font-bold text-white">{formatPrice(total)}</span>
            </div>
          </div>

          {state.error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
