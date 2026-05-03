'use server';
// lib/actions/orders.ts

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, Order, ShippingAddress } from '@/types';

// ── CHECKOUT ───────────────────────────────────────────────
export async function checkoutAction(
  _prev: ActionResult<{ orderId: string }>,
  formData: FormData
): Promise<ActionResult<{ orderId: string }>> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Войдите в аккаунт' };

  const shippingAddr: ShippingAddress = {
    city:    formData.get('city')    as string,
    street:  formData.get('street')  as string,
    zip:     formData.get('zip')     as string,
    country: formData.get('country') as string || 'Казахстан',
  };

  if (!shippingAddr.city || !shippingAddr.street) {
    return { error: 'Укажите адрес доставки' };
  }

  const paymentMethod = formData.get('payment_method') as string || 'cash';

  const { data: orderId, error } = await supabase.rpc('checkout_cart', {
    p_buyer_id:       user.id,
    p_shipping_addr:  shippingAddr,
    p_payment_method: paymentMethod,
  });

  if (error) return { error: error.message };

  revalidatePath('/cart');
  revalidatePath('/profile');
  redirect(`/profile/orders/${orderId}`);
}

// ── GET USER ORDERS ────────────────────────────────────────
export async function getUserOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        id, quantity, unit_price, product_snapshot,
        product:products(id, name, images, slug)
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as Order[];
}

// ── GET SINGLE ORDER ───────────────────────────────────────
export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        id, quantity, unit_price, product_snapshot,
        product:products(id, name, images, slug, brand)
      )
    `)
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single();

  return data as unknown as Order | null;
}

// ── ADMIN: UPDATE ORDER STATUS ─────────────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<ActionResult> {
  const supabase = createClient();

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/admin');
  return {};
}

// ── ADMIN: GET ALL ORDERS ──────────────────────────────────
export async function getAllOrders(): Promise<Order[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from('orders')
    .select(`
      *,
      buyer:profiles(full_name, phone),
      items:order_items(id, quantity, unit_price)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  return (data ?? []) as unknown as Order[];
}
