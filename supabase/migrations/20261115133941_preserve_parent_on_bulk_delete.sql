-- Fix: deleting several related horses in one statement failed. The trigger left
-- the link (sire_id/dam_id) for the foreign key's "set null" action, which only
-- runs at the end of the statement; a second update of the same foal then saw a
-- link to an already-deleted horse. The trigger now clears the link itself while
-- copying the parent's name and breed.
create or replace function public.preserve_parent_on_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.horses
     set sire_id = null,
         sire_name = coalesce(sire_name, old.registered_name),
         sire_breed_id = coalesce(sire_breed_id, old.breed_id)
   where sire_id = old.id;

  update public.horses
     set dam_id = null,
         dam_name = coalesce(dam_name, old.registered_name),
         dam_breed_id = coalesce(dam_breed_id, old.breed_id)
   where dam_id = old.id;

  return old;
end;
$$;
