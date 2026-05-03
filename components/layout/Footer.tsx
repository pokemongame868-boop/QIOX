// components/layout/Footer.tsx
import Link from "next/link";
import { Instagram, Youtube, Send } from "lucide-react";

const FOOTER_LINKS = {
  Каталог: [
    { label: "Смартфоны", href: "/catalog/smartphones" },
    { label: "Ноутбуки", href: "/catalog/laptops" },
    { label: "Наушники", href: "/catalog/headphones" },
    { label: "Планшеты", href: "/catalog/tablets" },
    { label: "Бытовая техника", href: "/catalog/appliances" },
  ],
  Покупателям: [
    { label: "Доставка и оплата", href: "/delivery" },
    { label: "Возврат", href: "/returns" },
    { label: "Гарантия", href: "/warranty" },
    { label: "Кредит", href: "/credit" },
  ],
  Компания: [
    { label: "О нас", href: "/about" },
    { label: "Контакты", href: "/contacts" },
    { label: "Вакансии", href: "/jobs" },
    { label: "Блог", href: "/blog" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/">
              <span className="font-display text-2xl font-bold">
                QIO
                <span className="text-brand-blue">X</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Электроника нового поколения. Официальные гарантии,
              быстрая доставка по всему Казахстану.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-brand-blue transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-brand-blue transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-brand-blue transition-all"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h4 className="font-display font-semibold text-sm text-white">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© 2025 QIOX. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="hover:text-gray-400 transition-colors">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
