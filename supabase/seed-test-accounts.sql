-- ============================================================
-- QIOX test accounts
-- Run in Supabase SQL Editor after supabase/schema.sql
-- ============================================================
-- Login credentials:
--   client@qiox.test    / QioxTest123!
--   business@qiox.test  / QioxTest123!
--   admin@qiox.test     / QioxTest123!

create extension if not exists "pgcrypto";

do $$
declare
  buyer_id  uuid := '20000000-0000-4000-8000-000000000001';
  seller_id uuid := '20000000-0000-4000-8000-000000000002';
  admin_id  uuid := '20000000-0000-4000-8000-000000000003';
  test_password text := 'QioxTest123!';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      buyer_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'client@qiox.test',
      crypt(test_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Тестовый клиент","role":"buyer"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      seller_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'business@qiox.test',
      crypt(test_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Тестовый бизнес","role":"seller"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@qiox.test',
      crypt(test_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Администратор QIOX","role":"admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
  set
    email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

  insert into public.profiles (id, full_name, avatar_url, role, is_verified)
  values
    (buyer_id,  'Тестовый клиент', null, 'buyer',  true),
    (seller_id, 'Тестовый бизнес', null, 'seller', true),
    (admin_id,  'Администратор QIOX', null, 'admin', true)
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    is_verified = excluded.is_verified,
    updated_at = now();

  begin
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values
      (
        buyer_id,
        buyer_id,
        jsonb_build_object('sub', buyer_id::text, 'email', 'client@qiox.test'),
        'email',
        'client@qiox.test',
        now(),
        now(),
        now()
      ),
      (
        seller_id,
        seller_id,
        jsonb_build_object('sub', seller_id::text, 'email', 'business@qiox.test'),
        'email',
        'business@qiox.test',
        now(),
        now(),
        now()
      ),
      (
        admin_id,
        admin_id,
        jsonb_build_object('sub', admin_id::text, 'email', 'admin@qiox.test'),
        'email',
        'admin@qiox.test',
        now(),
        now(),
        now()
      )
    on conflict (provider, provider_id) do update
    set
      user_id = excluded.user_id,
      identity_data = excluded.identity_data,
      updated_at = now();
  exception
    when undefined_column then
      raise notice 'auth.identities schema differs in this Supabase project; auth.users and public.profiles were seeded.';
    when invalid_column_reference then
      raise notice 'auth.identities unique constraint differs in this Supabase project; auth.users and public.profiles were seeded.';
  end;
end $$;
