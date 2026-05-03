'use server';
// lib/actions/reviews.ts

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, Review } from '@/types';

// ── GET REVIEWS FOR PRODUCT ────────────────────────────────
export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  return (data ?? []) as Review[];
}

// ── CHECK IF USER REVIEWED ─────────────────────────────────
export async function getUserReview(productId: string): Promise<Review | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single();

  return data ?? null;
}

// ── SUBMIT REVIEW ──────────────────────────────────────────
export async function submitReview(
  _prev: ActionResult<Review>,
  formData: FormData
): Promise<ActionResult<Review>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Войдите в аккаунт, чтобы оставить отзыв' };

  const productId = formData.get('product_id') as string;
  const rating    = Number(formData.get('rating'));
  const title     = (formData.get('title')   as string)?.trim() || null;
  const comment   = (formData.get('comment') as string)?.trim() || null;

  if (!productId)         return { error: 'Товар не указан' };
  if (!rating || rating < 1 || rating > 5) return { error: 'Укажите оценку от 1 до 5' };

  // Check no duplicate
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single();

  if (existing) return { error: 'Вы уже оставили отзыв на этот товар' };

  const { data, error } = await supabase
    .from('reviews')
    .insert({ product_id: productId, user_id: user.id, rating, title, comment })
    .select('*, user:profiles(full_name, avatar_url)')
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/product/${productId}`);
  return { data: data as Review };
}

// ── UPDATE REVIEW ──────────────────────────────────────────
export async function updateReview(
  reviewId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const rating  = Number(formData.get('rating'));
  const title   = (formData.get('title')   as string)?.trim() || null;
  const comment = (formData.get('comment') as string)?.trim() || null;

  const { data: review } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (!review) return { error: 'Отзыв не найден' };

  const { error } = await supabase
    .from('reviews')
    .update({ rating, title, comment })
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/product/${review.product_id}`);
  return {};
}

// ── DELETE REVIEW ──────────────────────────────────────────
export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { data: review } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .single();

  if (!review) return { error: 'Отзыв не найден' };

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath(`/product/${review.product_id}`);
  return {};
}

// ── GET REVIEW STATS ───────────────────────────────────────
export async function getReviewStats(productId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (!data || data.length === 0) return { avg: 0, count: 0, distribution: {} };

  const count = data.length;
  const avg   = data.reduce((s, r) => s + r.rating, 0) / count;
  const distribution = data.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] ?? 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return { avg: Math.round(avg * 10) / 10, count, distribution };
}
