-- _baking_co production catalogue migration (run once after 02-live-catalog-migration.sql)
-- Safe for existing cakes: no rows are deleted or reset.

alter table public.cakes
  add column if not exists sort_order integer not null default 0;

alter table public.cakes
  add column if not exists min_notice_days integer not null default 0;

-- Prevent negative notice periods on new/updated rows.
alter table public.cakes
  drop constraint if exists cakes_min_notice_days_nonnegative;
alter table public.cakes
  add constraint cakes_min_notice_days_nonnegative
  check (min_notice_days >= 0) not valid;
alter table public.cakes
  validate constraint cakes_min_notice_days_nonnegative;

-- Faster storefront ordering/filtering as the catalogue grows.
create index if not exists cakes_live_sort_idx
  on public.cakes (active, available, featured desc, sort_order desc, created_at desc);

create index if not exists cakes_category_live_idx
  on public.cakes (category, active, available);

-- Existing RLS remains in force. Re-state the storefront rule idempotently.
drop policy if exists "Public can view available cakes" on public.cakes;
create policy "Public can view available cakes"
on public.cakes
for select
to anon, authenticated
using (
  (active = true and available = true)
  or exists (
    select 1 from public.admins
    where admins.user_id = auth.uid()
  )
);
