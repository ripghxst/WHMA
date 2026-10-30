-- T03: profile creation on sign-up, parent validation, pedigree view and
-- registration number generator.

-- New auth user -> profile ---------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, discord_username, in_game_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(trim(new.raw_user_meta_data ->> 'discord_username'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'in_game_name'), '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Parent validation ----------------------------------------------------------

-- Linked sire must be a stallion, linked dam a mare, and a horse can't be
-- its own grandparent.
create function public.validate_horse_parents()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  sire public.horses;
  dam public.horses;
begin
  if new.sire_id is not null then
    select * into sire from public.horses where id = new.sire_id;
    if sire.sex is distinct from 'stallion' then
      raise exception 'The sire must be a stallion' using errcode = 'check_violation';
    end if;
    if new.id in (sire.sire_id, sire.dam_id) then
      raise exception 'A horse cannot be its own grandparent' using errcode = 'check_violation';
    end if;
  end if;

  if new.dam_id is not null then
    select * into dam from public.horses where id = new.dam_id;
    if dam.sex is distinct from 'mare' then
      raise exception 'The dam must be a mare' using errcode = 'check_violation';
    end if;
    if new.id in (dam.sire_id, dam.dam_id) then
      raise exception 'A horse cannot be its own grandparent' using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

create trigger horses_validate_parents
  before insert or update of sire_id, dam_id on public.horses
  for each row execute function public.validate_horse_parents();

-- When a registered horse is deleted, its offspring keep its name and breed as
-- a manual parent entry instead of losing the parent entirely.
create function public.preserve_parent_on_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.horses
     set sire_name = coalesce(sire_name, old.registered_name),
         sire_breed_id = coalesce(sire_breed_id, old.breed_id)
   where sire_id = old.id;

  update public.horses
     set dam_name = coalesce(dam_name, old.registered_name),
         dam_breed_id = coalesce(dam_breed_id, old.breed_id)
   where dam_id = old.id;

  return old;
end;
$$;

create trigger horses_preserve_parent_on_delete
  before delete on public.horses
  for each row execute function public.preserve_parent_on_delete();

-- Pedigree view ----------------------------------------------------------------

-- One row per horse with its parents and four grandparents. Each ancestor is
-- the linked registered horse when there is one, otherwise the manual entry.
-- security_invoker: callers only see ancestors that RLS lets them see.
create view public.horse_pedigree
with (security_invoker = true)
as
with parent as (
  select
    h.id as horse_id,
    s.id as sire_id,
    coalesce(s.registered_name, h.sire_name) as sire_name,
    coalesce(s.breed_id, h.sire_breed_id) as sire_breed_id,
    s.registration_number as sire_number,
    d.id as dam_id,
    coalesce(d.registered_name, h.dam_name) as dam_name,
    coalesce(d.breed_id, h.dam_breed_id) as dam_breed_id,
    d.registration_number as dam_number,
    s.sire_id as ss_link, s.sire_name as ss_name, s.sire_breed_id as ss_breed,
    s.dam_id as sd_link, s.dam_name as sd_name, s.dam_breed_id as sd_breed,
    d.sire_id as ds_link, d.sire_name as ds_name, d.sire_breed_id as ds_breed,
    d.dam_id as dd_link, d.dam_name as dd_name, d.dam_breed_id as dd_breed
  from public.horses h
  left join public.horses s on s.id = h.sire_id
  left join public.horses d on d.id = h.dam_id
)
select
  p.horse_id,

  p.sire_id,
  p.sire_name,
  sb.name as sire_breed,
  p.sire_number,

  p.dam_id,
  p.dam_name,
  db.name as dam_breed,
  p.dam_number,

  ss.id as sire_sire_id,
  coalesce(ss.registered_name, p.ss_name) as sire_sire_name,
  ssb.name as sire_sire_breed,
  ss.registration_number as sire_sire_number,

  sd.id as sire_dam_id,
  coalesce(sd.registered_name, p.sd_name) as sire_dam_name,
  sdb.name as sire_dam_breed,
  sd.registration_number as sire_dam_number,

  ds.id as dam_sire_id,
  coalesce(ds.registered_name, p.ds_name) as dam_sire_name,
  dsb.name as dam_sire_breed,
  ds.registration_number as dam_sire_number,

  dd.id as dam_dam_id,
  coalesce(dd.registered_name, p.dd_name) as dam_dam_name,
  ddb.name as dam_dam_breed,
  dd.registration_number as dam_dam_number
from parent p
left join public.breeds sb on sb.id = p.sire_breed_id
left join public.breeds db on db.id = p.dam_breed_id
left join public.horses ss on ss.id = p.ss_link
left join public.breeds ssb on ssb.id = coalesce(ss.breed_id, p.ss_breed)
left join public.horses sd on sd.id = p.sd_link
left join public.breeds sdb on sdb.id = coalesce(sd.breed_id, p.sd_breed)
left join public.horses ds on ds.id = p.ds_link
left join public.breeds dsb on dsb.id = coalesce(ds.breed_id, p.ds_breed)
left join public.horses dd on dd.id = p.dd_link
left join public.breeds ddb on ddb.id = coalesce(dd.breed_id, p.dd_breed);

comment on view public.horse_pedigree is 'Horse with sire, dam and four grandparents (linked or manual).';

-- Registration number -----------------------------------------------------------

-- Builds WHMA-{code}{1|2}-{6 digits} following the WHMA registration page:
--   code  = the horse's own breed code when its breed is classified, otherwise
--           the classified parent's (sire first). Matches every existing record,
--           e.g. a Morgan out of a Kiger Mustang dam is KM1.
--   1 | 2 = how many parents are classified breeds.
-- Raises when no parent is classified (the horse is not eligible).
-- TODO: the 6-digit sequence is random and unique; confirm with the client
-- (existing numbers all look like shuffles of 1-6).
create function public.generate_registration_number(p_horse_id uuid)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  h public.horses;
  own_breed public.breeds;
  sire_breed public.breeds;
  dam_breed public.breeds;
  classified_parents int;
  breed_code text;
  candidate text;
begin
  select * into h from public.horses where id = p_horse_id;
  if not found then
    raise exception 'Horse % not found', p_horse_id using errcode = 'no_data_found';
  end if;

  select * into own_breed from public.breeds where id = h.breed_id;
  select b.* into sire_breed from public.breeds b
    where b.id = coalesce((select breed_id from public.horses where id = h.sire_id), h.sire_breed_id);
  select b.* into dam_breed from public.breeds b
    where b.id = coalesce((select breed_id from public.horses where id = h.dam_id), h.dam_breed_id);

  classified_parents := (coalesce(sire_breed.is_classified, false))::int
                      + (coalesce(dam_breed.is_classified, false))::int;

  if classified_parents = 0 then
    raise exception 'Not eligible: neither parent is a classified breed' using errcode = 'check_violation';
  end if;

  breed_code := coalesce(
    case when own_breed.is_classified then own_breed.code end,
    case when sire_breed.is_classified then sire_breed.code end,
    dam_breed.code
  );

  loop
    candidate := format('WHMA-%s%s-%s', breed_code, classified_parents,
                        lpad((100000 + floor(random() * 900000))::int::text, 6, '0'));
    exit when not exists (select 1 from public.horses where registration_number = candidate);
  end loop;

  return candidate;
end;
$$;

revoke execute on function public.generate_registration_number(uuid) from public, anon;
grant execute on function public.generate_registration_number(uuid) to authenticated;
