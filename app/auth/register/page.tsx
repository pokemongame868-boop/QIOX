// app/auth/register/page.tsx
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = { title: 'Регистрация — QIOX' };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-blue/8 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-display text-3xl font-bold">
              QIO<span className="text-brand-blue">X</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Создайте новый аккаунт</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          <RegisterForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-brand-blue-light hover:text-white transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
