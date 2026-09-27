-- _baking_co orders / enquiries
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('BC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  enquiry_type text not null default 'cart' check (enquiry_type in ('cart','custom')),
  customer_name text not null,
  phone text not null,
  celebration_date date not null,
  fulfilment text not null check (fulfilment in ('Delivery','Pickup')),
  area text not null,
  locality text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2),
  notes text not null default '',
  details jsonb not null default '{}'::jsonb,
  whatsapp_message text not null,
  status text not null default 'new' check (status in ('new','contacted','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create or replace function public.orders_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.orders_set_updated_at();

drop policy if exists "Anyone can submit an enquiry" on public.orders;
create policy "Anyone can submit an enquiry" on public.orders for insert to anon, authenticated with check (status = 'new');

drop policy if exists "Admins can view enquiries" on public.orders;
create policy "Admins can view enquiries" on public.orders for select to authenticated using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

drop policy if exists "Admins can update enquiries" on public.orders;
create policy "Admins can update enquiries" on public.orders for update to authenticated using (exists (select 1 from public.admins where admins.user_id = auth.uid())) with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));

create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
