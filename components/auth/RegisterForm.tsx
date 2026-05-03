'use client';
// components/auth/RegisterForm.tsx

import { useFormState, useFormStatus } from 'react-dom';
import { registerAction } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ShoppingBag, Store } from 'lucide-react';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light font-bold text-white transition-all hover:shadow-blue-glow disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Создание аккаунта...' : 'Создать аккаунт'}
    </button>
  );
}

export default function RegisterForm() {
  const [state, action] = useFormState(registerAction, {});
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Full name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Имя и фамилия</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            name="full_name"
            required
            placeholder="Иван Иванов"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 outline-none focus:border-brand-blue transition-colors text-sm"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 outline-none focus:border-brand-blue transition-colors text-sm"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Пароль</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type={showPass ? 'text' : 'password'}
            name="password"
            required
            minLength={6}
            placeholder="Минимум 6 символов"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 outline-none focus:border-brand-blue transition-colors text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role selector */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Тип аккаунта</label>
        <input type="hidden" name="role" value={role} />
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'buyer',  label: 'Покупатель', icon: ShoppingBag, desc: 'Покупаю товары' },
            { value: 'seller', label: 'Продавец',   icon: Store,       desc: 'Продаю товары' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value as 'buyer' | 'seller')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                role === opt.value
                  ? 'border-brand-blue bg-brand-blue/10 text-white'
                  : 'border-dark-border text-gray-500 hover:border-gray-600'
              }`}
            >
              <opt.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <SubmitButton />

      <p className="text-xs text-gray-600 text-center">
        Регистрируясь, вы соглашаетесь с{' '}
        <a href="/terms" className="text-gray-400 hover:text-white">условиями</a>
      </p>
    </form>
  );
}
