-- T04: row level security, field guards and photo storage.
--
-- Who can do what:
--   anon       read approved horses (+ their photos and pedigree), breeds, profiles
--   member     read own horses at any status; create; edit/delete while draft or
--              changes_requested; the only status change allowed is submitting (-> pending)
--   admin      everything
-- SQL run without a JWT (dashboard, migrations, import scripts) is not restricted.

-- Helpers ------------------------------------------------------------------------

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create function private.is_admin()
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

revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- Breeds -------------------------------------------------------------------------

create policy "Breeds are public"
  on public.breeds for select
  to anon, authenticated
  using (true);

create policy "Admins add breeds"
  on public.breeds for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins edit breeds"
  on public.breeds for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins delete breeds"
  on public.breeds for delete
  to authenticated
  using ((select private.is_admin()));

-- Profiles -----------------------------------------------------------------------
-- Profiles hold only public fields (no email), so they are readable by everyone.

create policy "Profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Members update their own profile; admins update any"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

create function private.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not (select private.is_admin()) then
    raise exception 'Only admins can change member roles' using errcode = 'insufficient_privilege';
  end if;
  -- Admins can't demote themselves (prevents locking the board out).
  if new.role is distinct from old.role and old.id = (select auth.uid()) then
    raise exception 'You cannot change your own role' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update of role on public.profiles
  for each row execute function private.guard_profile_role();

-- Horses -------------------------------------------------------------------------

create policy "Approved horses are public"
  on public.horses for select
  to anon
  using (status = 'approved');

create policy "Members see approved and own horses; admins see all"
  on public.horses for select
  to authenticated
  using (
    status = 'approved'
    or owner_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "Members create their own horses; admins create any"
  on public.horses for insert
  to authenticated
  with check (
    (owner_id = (select auth.uid()) and status in ('draft', 'pending'))
    or (select private.is_admin())
  );

create policy "Members edit own drafts and returned horses; admins edit any"
  on public.horses for update
  to authenticated
  using (
    (owner_id = (select auth.uid()) and status in ('draft', 'changes_requested'))
    or (select private.is_admin())
  )
  with check (
    (owner_id = (select auth.uid()) and status in ('draft', 'changes_requested', 'pending'))
    or (select private.is_admin())
  );

create policy "Members delete own drafts and returned horses; admins delete any"
  on public.horses for delete
  to authenticated
  using (
    (owner_id = (select auth.uid()) and status in ('draft', 'changes_requested'))
    or (select private.is_admin())
  );

-- Board-only fields can't be set by members, even through the API directly.
create function private.guard_horse_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or (select private.is_admin()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.registration_number is not null or new.review_note is not null
       or new.reviewed_by is not null or new.reviewed_at is not null
       or new.registration_date is not null or new.is_foundation
       or new.legacy_owner_discord is not null or new.legacy_owner_name is not null then
      raise exception 'Only the registration board can set these fields' using errcode = 'insufficient_privilege';
    end if;
  else
    if new.registration_number is distinct from old.registration_number
       or new.review_note is distinct from old.review_note
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at
       or new.registration_date is distinct from old.registration_date
       or new.is_foundation is distinct from old.is_foundation
       or new.owner_id is distinct from old.owner_id
       or new.legacy_owner_discord is distinct from old.legacy_owner_discord
       or new.legacy_owner_name is distinct from old.legacy_owner_name then
      raise exception 'Only the registration board can change these fields' using errcode = 'insufficient_privilege';
    end if;
    if new.status is distinct from old.status and new.status <> 'pending' then
      raise exception 'Members can only submit a horse for review' using errcode = 'insufficient_privilege';
    end if;
  end if;

  if new.status = 'pending' and (tg_op = 'INSERT' or old.status <> 'pending') then
    new.submitted_at := now();
  end if;

  return new;
end;
$$;

create trigger horses_guard_fields
  before insert or update on public.horses
  for each row execute function private.guard_horse_fields();

-- Every submission is recorded in the review history.
create function private.log_horse_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status <> 'pending') then
    insert into public.horse_reviews (horse_id, actor_id, action)
    values (new.id, (select auth.uid()), 'submitted');
  end if;
  return new;
end;
$$;

revoke execute on function private.log_horse_submission() from public, anon, authenticated;

create trigger horses_log_submission
  after insert or update of status on public.horses
  for each row execute function private.log_horse_submission();

-- Photos -------------------------------------------------------------------------
-- A photo is visible whenever its horse is visible to the caller.

create policy "Photos follow their horse"
  on public.horse_photos for select
  to anon, authenticated
  using (exists (select 1 from public.horses h where h.id = horse_id));

create function private.can_edit_horse(p_horse_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_admin())
    or exists (
      select 1 from public.horses h
      where h.id = p_horse_id
        and h.owner_id = (select auth.uid())
        and h.status in ('draft', 'changes_requested')
    );
$$;

revoke execute on function private.can_edit_horse(uuid) from public;
grant execute on function private.can_edit_horse(uuid) to authenticated;

create policy "Owners add photos to editable horses"
  on public.horse_photos for insert
  to authenticated
  with check (private.can_edit_horse(horse_id));

create policy "Owners reorder photos of editable horses"
  on public.horse_photos for update
  to authenticated
  using (private.can_edit_horse(horse_id))
  with check (private.can_edit_horse(horse_id));

create policy "Owners remove photos of editable horses"
  on public.horse_photos for delete
  to authenticated
  using (private.can_edit_horse(horse_id));

-- Review history -----------------------------------------------------------------

create policy "Owners read their horses' history; admins read all"
  on public.horse_reviews for select
  to authenticated
  using (
    (select private.is_admin())
    or exists (
      select 1 from public.horses h
      where h.id = horse_id and h.owner_id = (select auth.uid())
    )
  );

create policy "Admins record reviews"
  on public.horse_reviews for insert
  to authenticated
  with check ((select private.is_admin()) and actor_id = (select auth.uid()));

-- Storage: horse-photos bucket ---------------------------------------------------
-- Path: {owner_id}/{horse_id}/{file}. Public read through public URLs; no listing.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('horse-photos', 'horse-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create function private.can_edit_photo_path(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_admin())
    or (
      (storage.foldername(object_name))[1] = (select auth.uid())::text
      and exists (
        select 1 from public.horses h
        where h.id::text = (storage.foldername(object_name))[2]
          and private.can_edit_horse(h.id)
      )
    );
$$;

revoke execute on function private.can_edit_photo_path(text) from public;
grant execute on function private.can_edit_photo_path(text) to authenticated;

create policy "Owners read their own photo files; admins read all"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'horse-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin()))
  );

create policy "Owners upload photos of editable horses"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'horse-photos' and private.can_edit_photo_path(name));

create policy "Owners replace photos of editable horses"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'horse-photos' and private.can_edit_photo_path(name))
  with check (bucket_id = 'horse-photos' and private.can_edit_photo_path(name));

create policy "Owners delete photos of editable horses"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'horse-photos' and private.can_edit_photo_path(name));
