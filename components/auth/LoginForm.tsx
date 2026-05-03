'use client';
// components/auth/LoginForm.tsx

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-blue-light font-bold text-white transition-all hover:shadow-blue-glow disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {pending ? 'Вход...' : 'Войти'}
    </button>
  );
}

export default function LoginForm({ next }: { next?: string }) {
  const [state, action] = useFormState(loginAction, {});
  const [showPass, setShowPass] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

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
            placeholder="••••••••"
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

      <SubmitButton />
    </form>
  );
}
