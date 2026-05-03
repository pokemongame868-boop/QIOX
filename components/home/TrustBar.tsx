// components/home/TrustBar.tsx
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Быстрая доставка",
    desc: "1-3 дня по Казахстану",
    color: "text-brand-blue-light",
    bg: "bg-brand-blue/10",
  },
  {
    icon: ShieldCheck,
    title: "Официальная гарантия",
    desc: "от 12 до 36 месяцев",
    color: "text-brand-green",
    bg: "bg-brand-green/10",
  },
  {
    icon: RotateCcw,
    title: "Возврат 30 дней",
    desc: "Без вопросов",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: Headphones,
    title: "Поддержка 24/7",
    desc: "Всегда на связи",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
];

export default function TrustBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {FEATURES.map((feat) => {
        const Icon = feat.icon;
        return (
          <div
            key={feat.title}
            className="flex items-center gap-3 p-4 rounded-xl bg-dark-card border border-dark-border hover:border-dark-border/80 transition-colors"
          >
            <div className={`p-2.5 rounded-xl ${feat.bg} flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${feat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">
                {feat.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{feat.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
