create extension if not exists pgcrypto;
create type public.user_role as enum ('customer','admin');
create type public.order_status as enum ('pending','paid','shipped','completed','cancelled');
create table if not exists public.perfis (id uuid primary key references auth.users(id) on delete cascade, full_name text, role public.user_role not null default 'customer', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.categorias (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, created_at timestamptz not null default now());
create table if not exists public.stores (id uuid primary key default gen_random_uuid(), name text not null, logo_url text, website_url text, created_at timestamptz not null default now());
create table if not exists public.produtos (id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, description text not null, price numeric(12,2) not null check(price >= 0), compare_at_price numeric(12,2), affiliate_url text not null, image_url text not null, gallery jsonb not null default '[]'::jsonb, videos jsonb not null default '[]'::jsonb, badge text, category_id uuid references public.categorias(id) on delete set null, store_id uuid references public.stores(id) on delete set null, is_active boolean not null default true, is_featured boolean not null default false, is_offer boolean not null default false, is_new boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.pedidos (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete restrict, status public.order_status not null default 'pending', total numeric(12,2) not null check(total >= 0), shipping_address jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.itens_pedido (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.pedidos(id) on delete cascade, product_id uuid references public.produtos(id) on delete set null, title text not null, quantity integer not null check(quantity > 0), unit_price numeric(12,2) not null check(unit_price >= 0));
create index if not exists produtos_active_idx on public.produtos(is_active); create index if not exists produtos_category_idx on public.produtos(category_id); create index if not exists pedidos_user_idx on public.pedidos(user_id); create index if not exists itens_order_idx on public.itens_pedido(order_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.perfis(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.perfis enable row level security; alter table public.categorias enable row level security; alter table public.stores enable row level security; alter table public.produtos enable row level security; alter table public.pedidos enable row level security; alter table public.itens_pedido enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.perfis where id=auth.uid() and role='admin'); $$;

drop policy if exists "public read categories" on public.categorias; create policy "public read categories" on public.categorias for select using (true);
drop policy if exists "public read stores" on public.stores; create policy "public read stores" on public.stores for select using (true);
drop policy if exists "public read active products" on public.produtos; create policy "public read active products" on public.produtos for select using (is_active=true or public.is_admin());
drop policy if exists "admin manage products" on public.produtos; create policy "admin manage products" on public.produtos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own profile" on public.perfis; create policy "own profile" on public.perfis for select using (id=auth.uid() or public.is_admin());
drop policy if exists "own orders" on public.pedidos; create policy "own orders" on public.pedidos for select using (user_id=auth.uid() or public.is_admin());
drop policy if exists "own create orders" on public.pedidos; create policy "own create orders" on public.pedidos for insert with check (user_id=auth.uid());
drop policy if exists "admin manage orders" on public.pedidos; create policy "admin manage orders" on public.pedidos for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own order items" on public.itens_pedido; create policy "own order items" on public.itens_pedido for select using (exists(select 1 from public.pedidos p where p.id=order_id and (p.user_id=auth.uid() or public.is_admin())));
drop policy if exists "own create order items" on public.itens_pedido; create policy "own create order items" on public.itens_pedido for insert with check (exists(select 1 from public.pedidos p where p.id=order_id and p.user_id=auth.uid()));
drop policy if exists "admin manage categories" on public.categorias; create policy "admin manage categories" on public.categorias for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage stores" on public.stores; create policy "admin manage stores" on public.stores for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets(id,name,public) values('product-media','product-media',true) on conflict(id) do update set public=true;
drop policy if exists "public media read" on storage.objects; create policy "public media read" on storage.objects for select using(bucket_id='product-media');
drop policy if exists "admin media insert" on storage.objects; create policy "admin media insert" on storage.objects for insert with check(bucket_id='product-media' and public.is_admin());
drop policy if exists "admin media update" on storage.objects; create policy "admin media update" on storage.objects for update using(bucket_id='product-media' and public.is_admin()) with check(bucket_id='product-media' and public.is_admin());
drop policy if exists "admin media delete" on storage.objects; create policy "admin media delete" on storage.objects for delete using(bucket_id='product-media' and public.is_admin());

-- Primeiro administrador: crie o usuário em Authentication > Users e execute:
-- update public.perfis set role='admin' where id=(select id from auth.users where email='admin@seudominio.com');
