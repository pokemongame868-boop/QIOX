'use server';
// lib/actions/cart.ts

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, CartItem } from '@/types';

// ── GET CART ───────────────────────────────────────────────
export async function getCart(): Promise<CartItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('cart_full')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as CartItem[];
}

// ── ADD TO CART ────────────────────────────────────────────
export async function addToCart(
  productId: string,
  quantity = 1
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Войдите в аккаунт' };

  // Check stock
  const { data: product } = await supabase
    .from('products')
    .select('stock_qty, status')
    .eq('id', productId)
    .single();

  if (!product || product.status !== 'active') {
    return { error: 'Товар недоступен' };
  }
  if (product.stock_qty < quantity) {
    return { error: 'Недостаточно товара на складе' };
  }

  // Upsert: increment if already in cart
  const { error } = await supabase.rpc('upsert_cart_item', {
    p_user_id:    user.id,
    p_product_id: productId,
    p_quantity:   quantity,
  });

  // Fallback if rpc not available: simple upsert
  if (error) {
    const { error: err2 } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: user.id, product_id: productId, quantity },
        { onConflict: 'user_id,product_id' }
      );
    if (err2) return { error: err2.message };
  }

  revalidatePath('/cart');
  return {};
}

// ── UPDATE QUANTITY ────────────────────────────────────────
export async function updateCartQuantity(
  itemId: string,
  quantity: number
): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  if (quantity <= 0) return removeFromCart(itemId);

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/cart');
  return {};
}

// ── REMOVE FROM CART ───────────────────────────────────────
export async function removeFromCart(itemId: string): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/cart');
  return {};
}

// ── CLEAR CART ─────────────────────────────────────────────
export async function clearCart(): Promise<ActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  revalidatePath('/cart');
  return {};
}

// ── GET CART COUNT ─────────────────────────────────────────
export async function getCartCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return count ?? 0;
}
