-- Run once in the EXISTING v11 Supabase project.
-- Additive only: no cake, order or admin is deleted or reset.
begin;
create table if not exists public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
drop policy if exists "Everyone can read website settings" on public.site_settings;
create policy "Everyone can read website settings" on public.site_settings for select to anon,authenticated using(true);
drop policy if exists "Admins manage website settings" on public.site_settings;
create policy "Admins manage website settings" on public.site_settings for all to authenticated
  using(exists(select 1 from public.admins where user_id=auth.uid()))
  with check(exists(select 1 from public.admins where user_id=auth.uid()));
commit;
-- No seed row is required. The Node app uses data/site.json until the first
-- admin Save website settings action. Never put private values in content.
