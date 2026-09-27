-- _baking_co orders RLS verification/fix
-- Safe to run after 04-orders-enquiries-migration.sql.

alter table public.orders enable row level security;

drop policy if exists "Anyone can submit an enquiry" on public.orders;
create policy "Anyone can submit an enquiry"
on public.orders
for insert
to anon, authenticated
with check (
  status = 'new'
  and customer_name <> ''
  and phone <> ''
);

-- IMPORTANT: there is deliberately no public SELECT policy.
-- Customers can INSERT an enquiry but cannot read the orders table.
-- The v6 frontend therefore performs INSERT without .select().

drop policy if exists "Admins can view enquiries" on public.orders;
create policy "Admins can view enquiries"
on public.orders
for select
to authenticated
using (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "Admins can update enquiries" on public.orders;
create policy "Admins can update enquiries"
on public.orders
for update
to authenticated
using (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
)
with check (
  exists (select 1 from public.admins where admins.user_id = auth.uid())
);
