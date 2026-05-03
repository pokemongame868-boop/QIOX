'use server';
// lib/actions/wishlist.ts

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, Product } from '@/types';

// ── GET WISHLIST ───────────────────────────────────────────
export async function getWishlist(): Promise<Product[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Join wishlist_items → products_full view
  const { data } = await supabase
    .from('wishlist_items')
    .select(`
      id,
      created_at,
      product:products_full(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []).map((item: any) => item.product).filter(Boolean) as Product[];
}

// ── GET WISHLIST PRODUCT IDs (for UI state) ────────────────
export async function getWishlistIds(): Promise<string[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('wishlist_items')
    .select('product_id')
    .eq('user_id', user.id);

  return (data ?? []).map((r: any) => r.product_id);
}

// ── TOGGLE WISHLIST ────────────────────────────────────────
// Returns new state: true = added, false = removed
export async function toggleWishlist(productId: string): Promise<ActionResult<boolean>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Войдите в аккаунт' };

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Remove
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', existing.id);

    if (error) return { error: error.message };
    revalidatePath('/wishlist');
    return { data: false };
  } else {
    // Add
    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, product_id: productId });

    if (error) return { error: error.message };
    revalidatePath('/wishlist');
    return { data: true };
  }
}

// ── REMOVE FROM WISHLIST ───────────────────────────────────
export async function removeFromWishlist(productId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) return { error: error.message };
  revalidatePath('/wishlist');
  return {};
}

// ── GET WISHLIST COUNT ─────────────────────────────────────
export async function getWishlistCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('wishlist_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return count ?? 0;
}
