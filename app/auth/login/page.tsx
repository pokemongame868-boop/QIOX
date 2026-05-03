// app/auth/login/page.tsx
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = { title: 'Вход — QIOX' };

interface Props {
  searchParams: { registered?: string; next?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-blue/8 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold">
              QIO<span className="text-brand-blue">X</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Войдите в свой аккаунт</p>
        </div>

        {/* Alerts */}
        {searchParams.registered && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green text-sm">
            ✓ Аккаунт создан! Войдите, чтобы продолжить.
          </div>
        )}
        {searchParams.error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            Ошибка входа. Попробуйте снова.
          </div>
        )}

        {/* Card */}
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          <LoginForm next={searchParams.next} />

          <p className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="text-brand-blue-light hover:text-white transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
