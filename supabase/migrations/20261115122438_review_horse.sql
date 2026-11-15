-- T11: one atomic board decision on a submitted horse.
-- Runs as the caller (security invoker), so RLS still applies on top of the
-- admin check, and the status change and history entry succeed or fail together.

create function public.review_horse(
  p_horse_id uuid,
  p_action public.review_action,
  p_note text default null,
  p_registration_number text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_status public.horse_status;
  note text := nullif(trim(p_note), '');
begin
  if not (select private.is_admin()) then
    raise exception 'Only the registration board can review horses' using errcode = 'insufficient_privilege';
  end if;

  select status into current_status from public.horses where id = p_horse_id for update;
  if not found then
    raise exception 'Horse not found' using errcode = 'no_data_found';
  end if;
  if current_status <> 'pending' then
    raise exception 'This horse is not waiting for review' using errcode = 'check_violation';
  end if;

  if p_action = 'approved' then
    if nullif(trim(p_registration_number), '') is null then
      raise exception 'A WHMA number is required to approve' using errcode = 'check_violation';
    end if;
    update public.horses
       set status = 'approved',
           registration_number = trim(p_registration_number),
           registration_date = current_date,
           review_note = null,
           reviewed_by = (select auth.uid()),
           reviewed_at = now()
     where id = p_horse_id;
  elsif p_action in ('changes_requested', 'rejected') then
    if note is null then
      raise exception 'Please explain what the member needs to know' using errcode = 'check_violation';
    end if;
    update public.horses
       set status = p_action::text::public.horse_status,
           review_note = note,
           reviewed_by = (select auth.uid()),
           reviewed_at = now()
     where id = p_horse_id;
  else
    raise exception 'Unknown review action %', p_action using errcode = 'check_violation';
  end if;

  insert into public.horse_reviews (horse_id, actor_id, action, note)
  values (p_horse_id, (select auth.uid()), p_action, note);
end;
$$;

revoke execute on function public.review_horse(uuid, public.review_action, text, text) from public, anon;
grant execute on function public.review_horse(uuid, public.review_action, text, text) to authenticated;
