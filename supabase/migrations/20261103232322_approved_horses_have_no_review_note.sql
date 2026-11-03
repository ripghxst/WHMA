-- T09: RLS is per row, so any column on an approved (public) horse can be read
-- through the API. Board notes stay private by only living on rows that aren't
-- public; approving clears the note, and history stays in horse_reviews.
update public.horses set review_note = null where status = 'approved' and review_note is not null;

alter table public.horses
  add constraint horses_approved_has_no_review_note
  check (status <> 'approved' or review_note is null);
