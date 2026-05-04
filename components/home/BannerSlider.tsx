"use client";

// components/home/BannerSlider.tsx
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, Star, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Banner } from "@/types";
import CategoryIcon from "@/components/ui/CategoryIcon";

interface BannerSliderProps {
  banners: Banner[];
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  НОВИНКА: <Zap className="w-3 h-3" />,
  "ХИТ ПРОДАЖ": <Star className="w-3 h-3" />,
  "СКИДКА 20%": <Tag className="w-3 h-3" />,
};

const BADGE_COLORS: Record<string, string> = {
  НОВИНКА: "bg-brand-blue text-white",
  "ХИТ ПРОДАЖ": "bg-brand-green text-dark-bg",
  "СКИДКА 20%": "bg-orange-500 text-white",
};

// Decorative background patterns per slide
const BG_DECORATIONS = [
  // Blue theme
  <>
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-blue/10 blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-brand-blue-light/5 blur-2xl" />
    <div className="absolute top-1/2 right-10 w-48 h-48 rounded-full border border-brand-blue/20 -translate-y-1/2" />
    <div className="absolute top-1/2 right-10 w-32 h-32 rounded-full border border-brand-blue/15 -translate-y-1/2 translate-x-8" />
  </>,
  // Green theme
  <>
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-green/8 blur-3xl" />
    <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-emerald-900/20 blur-2xl" />
    <div className="absolute top-6 right-12 w-24 h-24 rounded-full border border-brand-green/20" />
    <div className="absolute bottom-6 right-24 w-16 h-16 rounded-full bg-brand-green/10" />
  </>,
  // Purple theme
  <>
    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-800/15 blur-3xl" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(167,139,250,0.1),transparent)]" />
    <div className="absolute top-1/2 right-16 w-40 h-40 rounded-full border border-violet-500/20 -translate-y-1/2" />
  </>,
];

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 500);
    },
    [isAnimating]
  );

  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = useCallback(
    () => goTo((current + 1) % banners.length),
    [current, banners.length, goTo]
  );

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const banner = banners[current];
  const showProductImage = banner.image && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [banner.image]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl group">
      {/* Slide */}
      <div
        key={banner.id}
        className={cn(
          "relative w-full min-h-[240px] md:min-h-[340px] lg:min-h-[420px] overflow-hidden",
          `bg-gradient-to-br ${banner.bg_gradient}`
        )}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {BG_DECORATIONS[current % BG_DECORATIONS.length]}
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 py-8 md:px-12 md:py-10 lg:px-16 lg:py-14 max-w-2xl">
          {/* Badge */}
          {banner.badge && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider mb-4 w-fit animate-banner-slide",
                BADGE_COLORS[banner.badge] || "bg-brand-blue text-white"
              )}
            >
              {BADGE_ICONS[banner.badge]}
              {banner.badge}
            </div>
          )}

          {/* Title */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 animate-banner-slide">
            {banner.title}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-300 text-base md:text-lg mb-2 animate-banner-slide max-w-sm">
            {banner.subtitle}
          </p>

          {/* Price tag */}
          {banner.tag && (
            <p
              className="text-2xl font-display font-bold mb-6 animate-banner-slide"
              style={{ color: banner.accent_color }}
            >
              {banner.tag}
            </p>
          )}

          {/* CTA */}
          <Link
            href={banner.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 w-fit text-dark-bg hover:shadow-lg"
            style={{ backgroundColor: banner.accent_color }}
          >
            {banner.cta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right side: product visual */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 md:w-2/5 hidden sm:flex items-center justify-center">
          <div
            className="relative w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full flex items-center justify-center animate-float"
            style={{
              background: `radial-gradient(circle, ${banner.accent_color}15, transparent 70%)`,
            }}
          >
            {showProductImage ? (
              <Image
                src={banner.image!}
                alt={banner.image_alt ?? banner.title}
                fill
                priority={current === 0}
                sizes="(max-width: 768px) 40vw, 320px"
                className="object-contain drop-shadow-[0_28px_45px_rgba(0,0,0,.45)] transition-transform duration-500"
                style={{ transform: `scale(${banner.visual_scale ?? 1})` }}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <CategoryIcon
                slug={banner.visual_category}
                className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44"
                style={{ color: banner.accent_color }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-dark-bg/60 backdrop-blur-md border border-dark-border text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-dark-surface hover:border-brand-blue"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-dark-bg/60 backdrop-blur-md border border-dark-border text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-dark-surface hover:border-brand-blue"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          key={`progress-${current}`}
          className="h-full bg-white/40"
          style={{
            animation: "progressBar 5s linear forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
