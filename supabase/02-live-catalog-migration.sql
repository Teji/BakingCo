-- Run once in Supabase SQL Editor before using the live admin.
alter table public.cakes add column if not exists active boolean not null default true;
alter table public.cakes add column if not exists sample boolean not null default false;
alter table public.cakes add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.cakes add column if not exists egg_options text[] not null default array['Confirm with baker']::text[];
alter table public.cakes add column if not exists ingredients text not null default '';
alter table public.cakes add column if not exists allergens text not null default '';
alter table public.cakes add column if not exists offer_ends date;
alter table public.cakes add column if not exists variants jsonb not null default '[]'::jsonb;

-- Public storefront should only see products intended for display.
drop policy if exists "Public can view available cakes" on public.cakes;
create policy "Public can view available cakes" on public.cakes for select to anon, authenticated
using ((active = true and available = true) or exists (select 1 from public.admins where admins.user_id = auth.uid()));
