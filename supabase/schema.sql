-- ============================================================================
-- Wedding Card: database for the admin panel.
-- Supabase → SQL Editor → New query → paste this whole file → Run.
-- Safe to run again (it only creates what is missing).
--
-- BEFORE RUNNING: replace  you@example.com  below with the email you log in with.
-- Then create that login: Supabase → Authentication → Users → Add user (email + password).
-- ============================================================================

-- Who may use the admin panel
create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('you@example.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Website settings (brand, WhatsApp number, prices...): one row
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

-- Per-design changes (name, occasion, opening, price, hidden, trending): one row per changed design
create table if not exists public.catalog (
  design_no int primary key check (design_no between 1 and 300),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Orders from the website's order form
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  design_no int check (design_no between 1 and 300),
  occasion text,
  names text,
  event_date text,
  code text not null check (length(code) between 10 and 20000),
  status text not null default 'new' check (status in ('new', 'done'))
);
create index if not exists orders_created_at on public.orders (created_at desc);

-- Invitation links made in the admin panel (history on every device)
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest text,
  who text,
  occasion text,
  design_no int,
  url text not null
);
create index if not exists invites_created_at on public.invites (created_at desc);

-- ---------------------------------------------------------------------------
-- Security (Row Level Security): who can read and change what
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.catalog enable row level security;
alter table public.orders enable row level security;
alter table public.invites enable row level security;

-- Nobody reads the admin list from the website (only the is_admin() check above uses it).
drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins for select using (public.is_admin());

-- Settings and catalog: everyone can read (the website shows them), only admins can change.
drop policy if exists "public reads settings" on public.site_settings;
create policy "public reads settings" on public.site_settings for select using (true);
drop policy if exists "admins change settings" on public.site_settings;
create policy "admins change settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public reads catalog" on public.catalog;
create policy "public reads catalog" on public.catalog for select using (true);
drop policy if exists "admins change catalog" on public.catalog;
create policy "admins change catalog" on public.catalog for all using (public.is_admin()) with check (public.is_admin());

-- Orders: anyone can place a new order; only admins can see, update or delete them.
drop policy if exists "anyone places an order" on public.orders;
create policy "anyone places an order" on public.orders for insert with check (status = 'new');
drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders for select using (public.is_admin());
drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders for delete using (public.is_admin());

-- Invitation history: admins only.
drop policy if exists "admins manage invites" on public.invites;
create policy "admins manage invites" on public.invites for all using (public.is_admin()) with check (public.is_admin());

-- Same check under the name the website code uses (js/db.js).
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin();
$$;

-- Short invitation links (cardalbum.vercel.app/i#Xy7Kq2p): the card is stored under a random code.
-- Visitors can only open a card by its exact code (get_card); nobody can list other people's invitations.
create table if not exists public.cards (
  id text primary key check (id ~ '^[A-Za-z0-9]{6,16}$'),
  data jsonb not null,
  guest text,
  share text,
  created_at timestamptz not null default now()
);
alter table public.cards enable row level security;
drop policy if exists "owners create cards" on public.cards;
create policy "owners create cards" on public.cards for insert with check (public.is_admin());
drop policy if exists "owners read cards" on public.cards;
create policy "owners read cards" on public.cards for select using (public.is_admin());
drop policy if exists "owners delete cards" on public.cards;
create policy "owners delete cards" on public.cards for delete using (public.is_admin());

create or replace function public.get_card(code text) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('data', data, 'guest', guest, 'share', share) from public.cards where id = code;
$$;
grant execute on function public.get_card(text) to anon, authenticated;
