'use server';
// lib/actions/auth.ts

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionResult, RegisterForm, LoginForm, Profile } from '@/types';

// ── REGISTER ──────────────────────────────────────────────
export async function registerAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();

  const payload: RegisterForm = {
    email:     formData.get('email')     as string,
    password:  formData.get('password')  as string,
    full_name: formData.get('full_name') as string,
    role:      (formData.get('role') as string || 'buyer') as RegisterForm['role'],
  };

  // Basic validation
  if (!payload.email || !payload.password || !payload.full_name) {
    return { error: 'Заполните все обязательные поля' };
  }
  if (payload.password.length < 6) {
    return { error: 'Пароль должен быть не менее 6 символов' };
  }
  if (!['buyer', 'seller'].includes(payload.role)) {
    return { error: 'Недопустимая роль' };
  }

  const { error } = await supabase.auth.signUp({
    email:    payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.full_name,
        role:      payload.role,
      },
    },
  });

  if (error) return { error: error.message };
  redirect('/auth/login?registered=1');
}

// ── LOGIN ──────────────────────────────────────────────────
export async function loginAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = createClient();

  const payload: LoginForm = {
    email:    formData.get('email')    as string,
    password: formData.get('password') as string,
  };
  const next = formData.get('next') as string | null;

  if (!payload.email || !payload.password) {
    return { error: 'Введите email и пароль' };
  }

  const { error } = await supabase.auth.signInWithPassword(payload);
  if (error) return { error: 'Неверный email или пароль' };

  redirect(next?.startsWith('/') ? next : '/');
}

// ── LOGOUT ─────────────────────────────────────────────────
export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}

// ── GET SESSION ────────────────────────────────────────────
export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── GET PROFILE ────────────────────────────────────────────
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!data) {
    return {
      id: user.id,
      role: (user.user_metadata?.role ?? 'buyer') as Profile['role'],
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null,
      avatar_url: null,
      phone: null,
      address: null,
      is_verified: false,
      created_at: user.created_at,
      updated_at: user.updated_at ?? user.created_at,
    };
  }

  return data as Profile | null;
}
