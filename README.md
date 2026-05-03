# QIOX — Интернет-магазин электроники

Современный интернет-магазин на Next.js 14 + Supabase с тёмной темой.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

```bash
cp .env.local.example .env.local
```

Заполни `.env.local` данными из Supabase Dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Настройка Supabase

1. Создай проект на [supabase.com](https://supabase.com)
2. Перейди в **SQL Editor**
3. Вставь содержимое `supabase-schema.sql` и выполни

### 4. Запуск

```bash
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000)

---

## 📁 Структура проекта

```
qiox-store/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (шрифты, метаданные)
│   ├── page.tsx                # Главная страница (Server Component)
│   ├── globals.css             # Глобальные стили + Tailwind
│   ├── not-found.tsx           # 404 страница
│   └── product/
│       └── [id]/
│           └── page.tsx        # Страница товара (Server Component)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Хедер (Client Component)
│   │   └── Footer.tsx          # Футер
│   ├── home/
│   │   ├── HeroSearch.tsx      # Поиск на главной (Client)
│   │   ├── BannerSlider.tsx    # Слайдер баннеров (Client)
│   │   ├── Categories.tsx      # Сетка категорий
│   │   ├── ProductGrid.tsx     # Сетка товаров с сортировкой (Client)
│   │   └── TrustBar.tsx        # Преимущества магазина
│   └── ui/
│       ├── ProductCard.tsx     # Карточка товара (Client)
│       └── ProductActions.tsx  # Кнопки товара (Client)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Браузерный клиент Supabase
│   │   └── server.ts           # Серверный клиент Supabase
│   ├── mock-data.ts            # Тестовые данные
│   └── utils.ts                # formatPrice, cn, calculateDiscount
│
├── types/
│   └── index.ts                # TypeScript типы
│
├── supabase-schema.sql         # SQL схема БД
├── tailwind.config.ts          # Tailwind конфиг
├── next.config.ts              # Next.js конфиг
└── .env.local.example          # Пример переменных окружения
```

---

## 🎨 Дизайн-система

| Элемент | Значение |
|---------|----------|
| Primary | `#2563EB` |
| Blue Light | `#3B82F6` |
| Green | `#22C55E` |
| Background | `#080B14` |
| Surface | `#0F1523` |
| Card | `#131928` |
| Border | `#1E2A3B` |
| Display font | Syne |
| Body font | DM Sans |

---

## 🗄️ База данных (Supabase)

| Таблица | Описание |
|---------|----------|
| `categories` | Категории товаров |
| `products` | Товары с характеристиками |
| `profiles` | Профили пользователей |
| `cart_items` | Корзина |
| `wishlist_items` | Избранное |
| `orders` | Заказы |
| `order_items` | Позиции заказов |
| `reviews` | Отзывы |

---

## ⚡ Следующие шаги

- [ ] Реальный поиск через Supabase Full-Text Search
- [ ] Фильтрация товаров (цена, бренд, рейтинг)
- [ ] Аутентификация через Supabase Auth
- [ ] Корзина с localStorage + синхронизация
- [ ] Страница чекаута
- [ ] Оплата через Kaspi / Stripe
- [ ] Панель администратора
- [ ] SEO оптимизация

---

## 🛠️ Команды

```bash
npm run dev      # Разработка
npm run build    # Сборка
npm run start    # Продакшн
npm run lint     # Линтинг
```
