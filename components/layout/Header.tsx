'use client';
// components/layout/Header.tsx

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Store, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Profile, UserRole } from '@/types';
import { logoutAction } from '@/lib/actions/auth';

interface Props { profile?: Profile | null; cartCount?: number; }

const NAV_LINKS = [
  { label: 'Каталог', href: '/catalog', hasDropdown: true },
  { label: 'Новинки', href: '/catalog?sort=newest' },
  { label: 'Скидки',  href: '/catalog?hasDiscount=true' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Покупатель',
  seller: 'Продавец',
  admin: 'Администратор',
};

export default function Header({ profile, cartCount = 0 }: Props) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobile,     setMobile]     = useState(false);
  const [searchFocus,setSearchFocus]= useState(false);
  const [userMenu,   setUserMenu]   = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const dashHref = profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/seller';
  const DashIcon = profile?.role === 'admin' ? Shield : Store;

  return (
    <>
      <div className="bg-brand-blue/10 border-b border-brand-blue/20 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between text-xs text-gray-400">
          <span>🚀 Бесплатная доставка от 15 000 ₸</span>
          <span>Пн–Вс: 9:00–22:00 · +7 (727) 000-00-00</span>
        </div>
      </div>

      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border shadow-[0_4px_30px_rgba(0,0,0,.5)]'
                 : 'bg-dark-bg/80 backdrop-blur-md border-b border-dark-border/50'
      )}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 md:gap-6 h-16">

            <Link href="/" className="flex-shrink-0 group">
              <span className="font-display text-2xl font-bold">
                QIO<span className="text-brand-blue group-hover:text-brand-blue-light transition-colors">X</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(l => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-dark-surface transition-all font-medium">
                  {l.label}
                  {l.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className={cn('flex-1 max-w-xl transition-all', searchFocus && 'max-w-2xl')}>
              <div className={cn('flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all',
                searchFocus ? 'bg-dark-surface border-brand-blue shadow-blue-glow'
                            : 'bg-dark-surface border-dark-border hover:border-gray-600')}>
                <Search className={cn('w-4 h-4 flex-shrink-0', searchFocus ? 'text-brand-blue-light' : 'text-gray-500')} />
                <input type="text" placeholder="Поиск товаров..."
                  onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)}
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none" />
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1">
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-dark-surface rounded-xl transition-all">
                  <div className="w-7 h-7 rounded-lg bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-brand-blue-light">
                    {profile ? (profile.full_name?.[0] ?? 'U').toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-medium hidden xl:block">
                    {profile ? profile.full_name?.split(' ')[0] : 'Войти'}
                  </span>
                  {profile && <ChevronDown className="w-3.5 h-3.5 hidden xl:block" />}
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-dark-surface border border-dark-border rounded-2xl shadow-card overflow-hidden z-50 animate-slide-in">
                    {profile ? (
                      <>
                        <div className="px-4 py-3 border-b border-dark-border">
                          <p className="text-sm font-semibold text-white">{profile.full_name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {ROLE_LABELS[profile.role]}
                          </p>
                        </div>
                        <div className="py-1.5">
                          <Link href="/profile" onClick={() => setUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-muted transition-colors">
                            <User className="w-4 h-4" /> Мой профиль
                          </Link>
                          {['seller', 'admin'].includes(profile.role) && (
                            <Link href={dashHref} onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-muted transition-colors">
                              <DashIcon className="w-4 h-4" />
                              {profile.role === 'admin' ? 'Админ-панель' : 'Панель продавца'}
                            </Link>
                          )}
                          <button onClick={() => startTransition(() => logoutAction())}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                            <LogOut className="w-4 h-4" /> Выйти
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <Link href="/auth/login" onClick={() => setUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-dark-muted transition-colors">
                          Войти
                        </Link>
                        <Link href="/auth/register" onClick={() => setUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-brand-blue-light hover:text-white hover:bg-dark-muted transition-colors">
                          Зарегистрироваться
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/cart"
                className="relative flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-light rounded-xl text-white transition-all hover:shadow-blue-glow active:scale-95">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-semibold hidden xl:block">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-green rounded-full text-xs font-bold flex items-center justify-center text-dark-bg border-2 border-dark-bg">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2 ml-auto">
              <Link href="/cart" className="relative p-2.5 text-gray-400">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-green rounded-full text-[10px] font-bold flex items-center justify-center text-dark-bg">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setMobile(!mobile)} className="p-2.5 text-gray-400">
                {mobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobile && (
          <div className="md:hidden border-t border-dark-border bg-dark-surface animate-slide-in">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(l => (
                <Link key={l.label} href={l.href} onClick={() => setMobile(false)}
                  className="block py-3 px-3 text-gray-300 hover:text-white hover:bg-dark-muted rounded-xl transition-colors font-medium">
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-dark-border">
                {profile ? (
                  <>
                    <Link href="/profile" onClick={() => setMobile(false)}
                      className="flex items-center gap-2 py-3 px-3 text-gray-300 hover:text-white rounded-xl text-sm font-medium">
                      <User className="w-4 h-4" />{profile.full_name}
                    </Link>
                    <button onClick={() => startTransition(() => logoutAction())}
                      className="w-full text-left flex items-center gap-2 py-3 px-3 text-red-400 rounded-xl text-sm">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/auth/login" onClick={() => setMobile(false)}
                      className="flex-1 text-center py-3 border border-dark-border rounded-xl text-sm font-medium text-gray-300">
                      Войти
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobile(false)}
                      className="flex-1 text-center py-3 bg-brand-blue rounded-xl text-sm font-medium text-white">
                      Регистрация
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
