-- Rum Collection: initial relational schema.
-- Apply only to a new Supabase project after reviewing the deployment checklist.

create extension if not exists pgcrypto;

create type public.account_role as enum ('member', 'admin');
create type public.bottle_status as enum ('draft', 'pending_review', 'published', 'archived');
create type public.collection_visibility as enum ('private', 'public');
create type public.ownership_condition as enum ('sealed', 'opened', 'empty', 'unknown');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_path text,
  preferred_language text not null default 'en',
  role public.account_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bottles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  official_name text not null,
  producer text,
  distillery text,
  bottler text,
  country text,
  region text,
  vintage_year integer,
  bottling_year integer,
  age_statement text,
  abv numeric(5,2),
  volume_ml integer,
  series_name text,
  edition_name text,
  bottle_count integer,
  description text,
  data_confidence text not null default 'unverified'
    check (data_confidence in ('unverified','partially_verified','verified')),
  status public.bottle_status not null default 'pending_review',
  created_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (vintage_year is null or vintage_year between 1500 and 2200),
  check (bottling_year is null or bottling_year between 1500 and 2200),
  check (abv is null or (abv >= 0 and abv <= 100)),
  check (volume_ml is null or volume_ml > 0),
  check (bottle_count is null or bottle_count > 0)
);

create table public.bottle_images (
  id uuid primary key default gen_random_uuid(),
  bottle_id uuid not null references public.bottles(id) on delete cascade,
  storage_path text not null,
  image_kind text not null default 'official'
    check (image_kind in ('official','label_front','label_back','packaging','detail')),
  alt_text text,
  credit text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My Rum Collection',
  description text,
  visibility public.collection_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  bottle_id uuid not null references public.bottles(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  condition public.ownership_condition not null default 'unknown',
  purchase_date date,
  purchase_price numeric(12,2),
  purchase_currency char(3),
  seller text,
  has_box boolean,
  bottle_number text,
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ownership_images (
  id uuid primary key default gen_random_uuid(),
  collection_item_id uuid not null references public.collection_items(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table public.bottle_proposals (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  proposed_data jsonb not null,
  source_url text,
  submitter_notes text,
  review_status text not null default 'pending'
    check (review_status in ('pending','approved','rejected','needs_changes')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.valuations (
  id uuid primary key default gen_random_uuid(),
  collection_item_id uuid not null references public.collection_items(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null,
  valuation_date date not null default current_date,
  valuation_method text not null
    check (valuation_method in ('auction_realized','dealer_listing','expert_estimate','owner_estimate')),
  source_url text,
  notes text,
  created_at timestamptz not null default now()
);

create index bottles_search_idx on public.bottles using gin (
  to_tsvector('simple', coalesce(official_name,'') || ' ' ||
  coalesce(producer,'') || ' ' || coalesce(distillery,'') || ' ' ||
  coalesce(bottler,'') || ' ' || coalesce(series_name,''))
);
create index bottles_country_year_idx on public.bottles(country, vintage_year);
create index collection_items_collection_idx on public.collection_items(collection_id);
create index collections_owner_idx on public.collections(owner_id);

-- New accounts receive a member profile. Role escalation is admin-only.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.bottles enable row level security;
alter table public.bottle_images enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.ownership_images enable row level security;
alter table public.bottle_proposals enable row level security;
alter table public.valuations enable row level security;

-- Profiles: members can read public identity fields; only owners/admins can edit.
create policy "Profiles are readable" on public.profiles
  for select using (true);
create policy "Members update own profile" on public.profiles
  for update using ((select auth.uid()) = id or public.is_admin())
  with check ((select auth.uid()) = id or public.is_admin());

-- Catalogue: published records are public; admins manage all records.
create policy "Published bottles are public" on public.bottles
  for select using (status = 'published' or public.is_admin());
create policy "Admins manage bottles" on public.bottles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Published bottle images are public" on public.bottle_images
  for select using (
    exists (select 1 from public.bottles b
      where b.id = bottle_id and b.status = 'published')
    or public.is_admin()
  );
create policy "Admins manage bottle images" on public.bottle_images
  for all using (public.is_admin()) with check (public.is_admin());

-- Collections: owner controls their collection; public collections can be viewed.
create policy "Public or own collections are readable" on public.collections
  for select using (visibility = 'public' or owner_id = (select auth.uid()) or public.is_admin());
create policy "Owners manage collections" on public.collections
  for insert with check (owner_id = (select auth.uid()));
create policy "Owners update collections" on public.collections
  for update using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());
create policy "Owners delete collections" on public.collections
  for delete using (owner_id = (select auth.uid()) or public.is_admin());

create policy "Items visible through collection" on public.collection_items
  for select using (
    exists (select 1 from public.collections c
      where c.id = collection_id
      and (c.owner_id = (select auth.uid()) or c.visibility = 'public'))
    or public.is_admin()
  );
create policy "Owners insert collection items" on public.collection_items
  for insert with check (
    exists (select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid()))
  );
create policy "Owners update collection items" on public.collection_items
  for update using (
    exists (select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid()))
    or public.is_admin()
  )
  with check (
    exists (select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid()))
    or public.is_admin()
  );
create policy "Owners delete collection items" on public.collection_items
  for delete using (
    exists (select 1 from public.collections c
      where c.id = collection_id and c.owner_id = (select auth.uid()))
    or public.is_admin()
  );

create policy "Owners manage ownership images" on public.ownership_images
  for all using (
    exists (
      select 1 from public.collection_items ci
      join public.collections c on c.id = ci.collection_id
      where ci.id = collection_item_id and c.owner_id = (select auth.uid())
    ) or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.collection_items ci
      join public.collections c on c.id = ci.collection_id
      where ci.id = collection_item_id and c.owner_id = (select auth.uid())
    ) or public.is_admin()
  );

create policy "Members submit bottle proposals" on public.bottle_proposals
  for insert with check (submitted_by = (select auth.uid()));
create policy "Members view own proposals admins view all" on public.bottle_proposals
  for select using (submitted_by = (select auth.uid()) or public.is_admin());
create policy "Admins review proposals" on public.bottle_proposals
  for update using (public.is_admin()) with check (public.is_admin());

create policy "Owners view valuations" on public.valuations
  for select using (
    exists (
      select 1 from public.collection_items ci
      join public.collections c on c.id = ci.collection_id
      where ci.id = collection_item_id and c.owner_id = (select auth.uid())
    ) or public.is_admin()
  );
create policy "Owners manage valuations" on public.valuations
  for all using (
    exists (
      select 1 from public.collection_items ci
      join public.collections c on c.id = ci.collection_id
      where ci.id = collection_item_id and c.owner_id = (select auth.uid())
    ) or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.collection_items ci
      join public.collections c on c.id = ci.collection_id
      where ci.id = collection_item_id and c.owner_id = (select auth.uid())
    ) or public.is_admin()
  );

-- NOTE: Storage buckets and object policies are documented in docs/DEPLOYMENT.md.
