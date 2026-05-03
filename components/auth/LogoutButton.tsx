'use client';
// components/auth/LogoutButton.tsx

import { useTransition } from 'react';
import { logoutAction } from '@/lib/actions/auth';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-border text-gray-400 hover:text-red-400 hover:border-red-500/40 text-sm font-medium transition-all disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {pending ? 'Выход...' : 'Выйти'}
    </button>
  );
}
