import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import HeaderWrapper from "@/components/layout/HeaderWrapper";
import Footer from "@/components/layout/Footer";

type InfoPage = {
  title: string;
  eyebrow: string;
  description: string;
  highlights: string[];
  sections: Array<{
    title: string;
    body: string;
  }>;
  action?: {
    label: string;
    href: string;
  };
};

const INFO_PAGES: Record<string, InfoPage> = {
  delivery: {
    title: "Доставка и оплата",
    eyebrow: "Покупателям",
    description:
      "Доставляем технику QIOX по Казахстану, принимаем оплату картой, переводом и при получении.",
    highlights: ["Доставка от 1 дня", "Самовывоз после подтверждения", "Безопасная онлайн-оплата"],
    sections: [
      {
        title: "Доставка",
        body: "После оформления заказа менеджер подтверждает наличие товара, адрес и удобный интервал доставки.",
      },
      {
        title: "Оплата",
        body: "Оплатить заказ можно банковской картой, Kaspi, безналичным переводом или при получении, если способ доступен для города.",
      },
    ],
    action: { label: "Перейти в каталог", href: "/catalog" },
  },
  returns: {
    title: "Возврат",
    eyebrow: "Покупателям",
    description:
      "Если товар не подошёл, мы поможем оформить возврат или обмен по правилам магазина и гарантии производителя.",
    highlights: ["Проверка обращения", "Обмен при наличии товара", "Поддержка на каждом шаге"],
    sections: [
      {
        title: "Как оформить",
        body: "Свяжитесь с нами, укажите номер заказа и причину обращения. Мы подскажем, какие документы и комплектность нужны.",
      },
      {
        title: "Сроки",
        body: "Срок обработки зависит от категории товара, состояния устройства и условий гарантии.",
      },
    ],
    action: { label: "Написать в поддержку", href: "/contacts" },
  },
  warranty: {
    title: "Гарантия",
    eyebrow: "Покупателям",
    description:
      "На товары распространяется официальная гарантия производителя или гарантийные условия продавца QIOX.",
    highlights: ["Официальные поставки", "Сервисная диагностика", "Помощь с документами"],
    sections: [
      {
        title: "Что покрывается",
        body: "Гарантия действует на заводские дефекты и неисправности, не связанные с нарушением условий эксплуатации.",
      },
      {
        title: "Что понадобится",
        body: "Сохраните чек, гарантийный талон и комплектность товара. Это ускорит диагностику и оформление обращения.",
      },
    ],
    action: { label: "Связаться с нами", href: "/contacts" },
  },
  credit: {
    title: "Кредит",
    eyebrow: "Покупателям",
    description:
      "Покупайте электронику сейчас и оплачивайте частями через доступные партнёрские финансовые сервисы.",
    highlights: ["Рассрочка на популярные товары", "Быстрое оформление", "Решение от партнёра"],
    sections: [
      {
        title: "Как это работает",
        body: "Выберите товар, перейдите к оформлению заказа и уточните доступные варианты оплаты в кредит или рассрочку.",
      },
      {
        title: "Условия",
        body: "Итоговые условия, срок и лимит определяются финансовым партнёром после проверки заявки.",
      },
    ],
    action: { label: "Выбрать товар", href: "/catalog" },
  },
  about: {
    title: "О нас",
    eyebrow: "Компания",
    description:
      "QIOX — маркетплейс современной электроники с фокусом на проверенные товары, понятный сервис и быструю доставку.",
    highlights: ["Техника нового поколения", "Проверенные продавцы", "Поддержка покупателей"],
    sections: [
      {
        title: "Наша задача",
        body: "Собрать в одном месте актуальную электронику и сделать покупку простой: от выбора до получения заказа.",
      },
      {
        title: "Подход",
        body: "Мы развиваем каталог, проверяем карточки товаров и строим сервис, который удобно использовать каждый день.",
      },
    ],
    action: { label: "Смотреть каталог", href: "/catalog" },
  },
  contacts: {
    title: "Контакты",
    eyebrow: "Компания",
    description:
      "Мы на связи по вопросам заказов, возвратов, сотрудничества и работы продавцов на площадке.",
    highlights: ["+7 (727) 000-00-00", "support@qiox.kz", "Казахстан, Алматы"],
    sections: [
      {
        title: "График",
        body: "Поддержка работает ежедневно с 9:00 до 22:00. Заявки из формы обратной связи обрабатываются по очереди.",
      },
      {
        title: "Для продавцов",
        body: "Напишите нам, если хотите разместить товары на QIOX или подключить свою витрину к маркетплейсу.",
      },
    ],
    action: { label: "Открыть каталог", href: "/catalog" },
  },
  jobs: {
    title: "Вакансии",
    eyebrow: "Компания",
    description:
      "Мы собираем команду вокруг продукта, сервиса и технологий электронной коммерции.",
    highlights: ["Продуктовая команда", "Рост вместе с маркетплейсом", "Открытые роли обновляются"],
    sections: [
      {
        title: "Кого ищем",
        body: "Нам интересны специалисты в разработке, поддержке, контенте, операциях и работе с продавцами.",
      },
      {
        title: "Как откликнуться",
        body: "Отправьте краткое резюме и направление, которое вам интересно, на почту поддержки.",
      },
    ],
    action: { label: "Контакты", href: "/contacts" },
  },
  blog: {
    title: "Блог",
    eyebrow: "Компания",
    description:
      "Собираем полезные материалы о выборе смартфонов, ноутбуков, аксессуаров и бытовой техники.",
    highlights: ["Гайды по выбору", "Обзоры новинок", "Советы по уходу за техникой"],
    sections: [
      {
        title: "Скоро",
        body: "Раздел блога готов к публикациям. Первые материалы будут посвящены выбору смартфона и ноутбука для работы.",
      },
      {
        title: "Что читать сейчас",
        body: "Пока статьи готовятся, можно перейти в каталог и сравнить актуальные модели по фильтрам.",
      },
    ],
    action: { label: "Перейти в каталог", href: "/catalog" },
  },
  privacy: {
    title: "Конфиденциальность",
    eyebrow: "Документы",
    description:
      "Мы бережно относимся к данным пользователей и используем их только для работы сервиса и обработки заказов.",
    highlights: ["Защита аккаунта", "Обработка заказов", "Сервисные уведомления"],
    sections: [
      {
        title: "Какие данные нужны",
        body: "Для оформления заказа могут использоваться имя, телефон, адрес доставки, email и история взаимодействия с сервисом.",
      },
      {
        title: "Зачем это нужно",
        body: "Данные помогают подтверждать заказы, доставлять товары, отвечать на обращения и улучшать работу маркетплейса.",
      },
    ],
    action: { label: "Связаться с поддержкой", href: "/contacts" },
  },
  terms: {
    title: "Пользовательское соглашение",
    eyebrow: "Документы",
    description:
      "Этот раздел описывает базовые правила использования QIOX, оформления заказов и взаимодействия с сервисом.",
    highlights: ["Правила заказов", "Ответственность сторон", "Условия сервиса"],
    sections: [
      {
        title: "Использование сайта",
        body: "Пользователь обязуется указывать корректные данные при регистрации, оформлении заказа и обращении в поддержку.",
      },
      {
        title: "Заказы",
        body: "Информация о наличии, цене и сроках доставки подтверждается при обработке заказа.",
      },
    ],
    action: { label: "Вернуться в каталог", href: "/catalog" },
  },
};

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props) {
  const page = INFO_PAGES[params.slug];
  return {
    title: page ? `${page.title} — QIOX` : "Страница не найдена — QIOX",
  };
}

export default function InfoPage({ params }: Props) {
  const page = INFO_PAGES[params.slug];

  if (!page) {
    notFound();
  }

  const isContacts = params.slug === "contacts";

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-brand-blue-light uppercase tracking-widest">
                  {page.eyebrow}
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                  {page.title}
                </h1>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl leading-relaxed">
                  {page.description}
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {page.highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-dark-border bg-dark-card px-4 py-4 text-sm text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-green mb-3" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {page.sections.map((section) => (
                  <section
                    key={section.title}
                    className="border-t border-dark-border pt-5"
                  >
                    <h2 className="font-display text-xl font-semibold text-white mb-2">
                      {section.title}
                    </h2>
                    <p className="text-gray-500 leading-relaxed max-w-3xl">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-dark-border bg-dark-surface p-5 md:p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  QIOX
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Электроника нового поколения с доставкой по Казахстану.
                </p>
              </div>

              {isContacts && (
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-brand-blue-light" />
                    +7 (727) 000-00-00
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand-blue-light" />
                    support@qiox.kz
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-brand-blue-light" />
                    Казахстан, Алматы
                  </div>
                </div>
              )}

              {page.action && (
                <Link
                  href={page.action.href}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2"
                >
                  {page.action.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
