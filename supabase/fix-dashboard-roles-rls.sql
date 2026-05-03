-- ============================================================
-- QIOX dashboard role/RLS fix
-- Run in Supabase SQL Editor if seller/admin dashboards redirect
-- to home or profile role cannot be read.
-- ============================================================

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

grant execute on function public.current_user_role() to anon, authenticated;

drop policy if exists "Own profile visible" on public.profiles;
drop policy if exists "Own profile editable" on public.profiles;
drop policy if exists "Admin sees all" on public.profiles;

create policy "Own profile visible"
on public.profiles for select
using (auth.uid() = id or public.current_user_role() = 'admin');

create policy "Own profile editable"
on public.profiles for update
using (auth.uid() = id or public.current_user_role() = 'admin')
with check (auth.uid() = id or public.current_user_role() = 'admin');

create policy "Admin inserts profiles"
on public.profiles for insert
with check (public.current_user_role() = 'admin');

create policy "Admin deletes profiles"
on public.profiles for delete
using (public.current_user_role() = 'admin');

update public.profiles
set role = 'buyer'
where id = '20000000-0000-4000-8000-000000000001';

update public.profiles
set role = 'seller'
where id = '20000000-0000-4000-8000-000000000002';

update public.profiles
set role = 'admin'
where id = '20000000-0000-4000-8000-000000000003';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"buyer","full_name":"Тестовый клиент"}'::jsonb
where id = '20000000-0000-4000-8000-000000000001';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"seller","full_name":"Тестовый бизнес"}'::jsonb
where id = '20000000-0000-4000-8000-000000000002';

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"admin","full_name":"Администратор QIOX"}'::jsonb
where id = '20000000-0000-4000-8000-000000000003';
