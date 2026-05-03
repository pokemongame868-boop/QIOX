'use client';
// components/product/ReviewsSection.tsx

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Star, ThumbsUp, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { Review } from '@/types';
import { submitReview } from '@/lib/actions/reviews';
import { useToast } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils';

// ── Star picker ───────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star className={cn('w-7 h-7 transition-colors', (hover || value) >= i
            ? 'fill-amber-400 text-amber-400' : 'text-gray-700 fill-gray-700')} />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-400">
        {value > 0 && ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'][value]}
      </span>
    </div>
  );
}

// ── Submit button ─────────────────────────────────────────
function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-light font-bold text-white text-sm transition-all hover:shadow-blue-glow disabled:opacity-60">
      {pending && <Loader2 className="w-4 h-4 animate-spin" />}
      {pending ? 'Публикуем...' : 'Опубликовать отзыв'}
    </button>
  );
}

// ── Review Form ───────────────────────────────────────────
function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: (r: Review) => void }) {
  const [rating, setRating] = useState(0);
  const [state, action]     = useFormState(submitReview, {});
  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (state.data && !state.error) {
      onSuccess(state.data);
    }
  }, [state.data, state.error, onSuccess]);

  return (
    <form action={action} className="bg-dark-surface border border-dark-border rounded-2xl p-6 space-y-4">
      <h3 className="font-display font-bold text-white">Оставить отзыв</h3>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating"     value={rating} />

      {state.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Stars */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Оценка *</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Title */}
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Заголовок</label>
        <input type="text" name="title" placeholder="Кратко о товаре..."
          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 text-sm outline-none focus:border-brand-blue transition-colors" />
      </div>

      {/* Comment */}
      <div>
        <label className="text-sm text-gray-400 mb-1.5 block">Отзыв</label>
        <textarea name="comment" rows={4} placeholder="Поделитесь впечатлениями..."
          className="w-full px-4 py-3 rounded-xl bg-dark-card border border-dark-border text-white placeholder-gray-600 text-sm outline-none focus:border-brand-blue transition-colors resize-none" />
      </div>

      <SubmitBtn />
    </form>
  );
}

// ── Rating distribution bar ───────────────────────────────
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-3">{stars}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
    </div>
  );
}

// ── Single review card ────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="py-5 border-b border-dark-border last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/15 border border-brand-blue/20 flex items-center justify-center font-display font-bold text-brand-blue-light text-sm flex-shrink-0">
            {(review.user?.full_name ?? 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{review.user?.full_name ?? 'Аноним'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={cn('w-3 h-3', i <= review.rating
                    ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700')} />
                ))}
              </div>
              {review.is_verified && (
                <span className="text-[10px] text-brand-green font-medium flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Верифицированная покупка
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 flex-shrink-0">
          {new Date(review.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {review.title && (
        <p className="text-sm font-semibold text-white mb-1">{review.title}</p>
      )}
      {review.comment && (
        <p className="text-sm text-gray-400 leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────
interface Stats { avg: number; count: number; distribution: Record<number, number>; }

interface Props {
  productId:  string;
  reviews:    Review[];
  stats:      Stats;
  isLoggedIn: boolean;
  hasReviewed: boolean;
}

export default function ReviewsSection({ productId, reviews: initial, stats, isLoggedIn, hasReviewed }: Props) {
  const [reviews, setReviews] = useState(initial);
  const [submitted, setSubmitted] = useState(hasReviewed);

  const handleSuccess = (review: Review) => {
    setReviews(prev => [review, ...prev]);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header + stats */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Average rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-display text-5xl font-bold text-white">{stats.avg || '—'}</p>
            <div className="flex items-center justify-center gap-0.5 mt-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={cn('w-4 h-4', i <= Math.round(stats.avg)
                  ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700')} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.count} отзывов</p>
          </div>
          {/* Distribution */}
          {stats.count > 0 && (
            <div className="flex-1 space-y-1.5 min-w-[160px]">
              {[5,4,3,2,1].map(s => (
                <RatingBar key={s} stars={s} count={stats.distribution[s] ?? 0} total={stats.count} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      {!isLoggedIn ? (
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-6 text-center">
          <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">Войдите, чтобы оставить отзыв</p>
          <a href="/auth/login" className="btn-primary inline-flex text-sm">Войти</a>
        </div>
      ) : submitted ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-green/10 border border-brand-green/30 rounded-xl">
          <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
          <p className="text-sm text-brand-green font-medium">Вы уже оставили отзыв на этот товар</p>
        </div>
      ) : (
        <ReviewForm productId={productId} onSuccess={handleSuccess} />
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">Отзывов пока нет. Будьте первым!</p>
        </div>
      ) : (
        <div>
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
