-- T03: core schema for members, breeds, horses, photos and review history.
-- RLS is enabled on every table here with no policies (deny all); policies come in T04.

create extension if not exists pg_trgm with schema extensions;

create type public.app_role as enum ('member', 'admin');
create type public.horse_sex as enum ('stallion', 'mare', 'gelding');
create type public.horse_status as enum ('draft', 'pending', 'changes_requested', 'approved', 'rejected');
create type public.review_action as enum ('submitted', 'approved', 'changes_requested', 'rejected', 'edited');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Breeds -------------------------------------------------------------------

create table public.breeds (
  id smallint generated always as identity primary key,
  name text not null unique,
  -- Two-letter registration code; only classified breeds have one.
  code text unique check (code ~ '^[A-Z]{2}$'),
  is_classified boolean not null default false,
  sort_order smallint not null default 100,
  constraint breeds_classified_has_code check (is_classified = (code is not null))
);

comment on table public.breeds is 'Horse breeds. Classified breeds qualify a horse for WHMA registration.';

-- Profiles -----------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  discord_username text check (char_length(discord_username) <= 40),
  in_game_name text check (char_length(in_game_name) <= 60),
  role public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Public member profile, one per auth user.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Horses -------------------------------------------------------------------

create table public.horses (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  registration_number text unique check (registration_number ~ '^WHMA-[A-Z]{2}[12]?-[0-9]{6}$'),
  registered_name text not null check (char_length(registered_name) between 1 and 120),
  barn_name text check (char_length(barn_name) <= 60),
  sex public.horse_sex,

  -- Breed and genetics (free text, matching the in-game values)
  breed_id smallint references public.breeds (id),
  pedigree text check (char_length(pedigree) <= 40),
  phenotype text check (char_length(phenotype) <= 80),
  genotype text check (char_length(genotype) <= 40),
  height text check (char_length(height) <= 20),
  eye_color text check (char_length(eye_color) <= 30),
  base_stats text check (char_length(base_stats) <= 40),

  -- Parents: a link to a registered horse, or a manually entered name and breed.
  sire_id uuid references public.horses (id) on delete set null,
  sire_name text check (char_length(sire_name) <= 120),
  sire_breed_id smallint references public.breeds (id),
  dam_id uuid references public.horses (id) on delete set null,
  dam_name text check (char_length(dam_name) <= 120),
  dam_breed_id smallint references public.breeds (id),

  -- Ownership. Imported records whose owner has no account yet keep the
  -- owner's Discord username / in-game name until an admin attaches them.
  owner_id uuid references public.profiles (id) on delete set null,
  legacy_owner_discord text,
  legacy_owner_name text,
  is_foundation boolean not null default false,

  -- Review workflow
  status public.horse_status not null default 'draft',
  review_note text check (char_length(review_note) <= 2000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  submitted_at timestamptz,
  registration_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint horses_not_own_sire check (sire_id <> id),
  constraint horses_not_own_dam check (dam_id <> id),
  constraint horses_distinct_parents check (sire_id <> dam_id),
  -- Anything past draft needs at least the sex and breed.
  constraint horses_submitted_has_basics check (status = 'draft' or (sex is not null and breed_id is not null))
);

comment on table public.horses is 'Registered horses and registration submissions.';
comment on column public.horses.sire_name is 'Manual sire name when the sire is not a registered horse. Ignored when sire_id is set.';
comment on column public.horses.dam_name is 'Manual dam name when the dam is not a registered horse. Ignored when dam_id is set.';

create trigger horses_set_updated_at
  before update on public.horses
  for each row execute function public.set_updated_at();

create index horses_status_idx on public.horses (status);
create index horses_owner_id_idx on public.horses (owner_id);
create index horses_breed_id_idx on public.horses (breed_id);
create index horses_sire_id_idx on public.horses (sire_id);
create index horses_dam_id_idx on public.horses (dam_id);
create index horses_sire_breed_id_idx on public.horses (sire_breed_id);
create index horses_dam_breed_id_idx on public.horses (dam_breed_id);
create index horses_reviewed_by_idx on public.horses (reviewed_by);
create index horses_registered_name_trgm_idx on public.horses using gin (registered_name extensions.gin_trgm_ops);
create index horses_barn_name_trgm_idx on public.horses using gin (barn_name extensions.gin_trgm_ops);

-- Photos -------------------------------------------------------------------

create table public.horse_photos (
  id uuid primary key default gen_random_uuid(),
  horse_id uuid not null references public.horses (id) on delete cascade,
  storage_path text not null unique,
  is_primary boolean not null default false,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index horse_photos_horse_id_idx on public.horse_photos (horse_id, sort_order);
create unique index horse_photos_one_primary_idx on public.horse_photos (horse_id) where is_primary;

-- Review history -----------------------------------------------------------

create table public.horse_reviews (
  id bigint generated always as identity primary key,
  horse_id uuid not null references public.horses (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.review_action not null,
  note text check (char_length(note) <= 2000),
  created_at timestamptz not null default now()
);

create index horse_reviews_horse_id_idx on public.horse_reviews (horse_id, created_at);
create index horse_reviews_actor_id_idx on public.horse_reviews (actor_id);

-- Lock everything down until T04 adds policies.
alter table public.breeds enable row level security;
alter table public.profiles enable row level security;
alter table public.horses enable row level security;
alter table public.horse_photos enable row level security;
alter table public.horse_reviews enable row level security;
