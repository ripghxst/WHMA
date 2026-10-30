-- T03: breed list.
-- Classified breeds and codes as published on ttr-whma.weebly.com/registration.html.
-- TODO: the Foundation sheet uses BR / CM / PZ for Brumby, Camargue and Przewalski's;
-- waiting on the client to confirm. Changing a code later is a single UPDATE.

insert into public.breeds (name, code, is_classified, sort_order) values
  ('Mustang', 'AM', true, 1),
  ('Kiger Mustang', 'KM', true, 2),
  ('Chincoteague Pony', 'CP', true, 3),
  ('Nokota', 'NK', true, 4),
  ('Brumby', 'BY', true, 5),
  ('Wild Donkey', 'WD', true, 6),
  ('Zebra', 'ZB', true, 7),
  ('Camargue', 'CA', true, 8),
  ('Przewalski''s Horse', 'PH', true, 9);

-- Other breeds seen in RedM and in the client's records. Admins can add more.
insert into public.breeds (name) values
  ('American Mammoth Jackstock'),
  ('American Paint'),
  ('American Quarter Horse'),
  ('American Standardbred'),
  ('Andalusian'),
  ('Appaloosa'),
  ('Arabian'),
  ('Ardennes'),
  ('Belgian Draft'),
  ('Breton'),
  ('Criollo'),
  ('Dutch Warmblood'),
  ('Gypsy Cob'),
  ('Hungarian Halfbred'),
  ('Kentucky Saddler'),
  ('Kladruber'),
  ('Missouri Fox Trotter'),
  ('Morgan'),
  ('Mule'),
  ('Norfolk Roadster'),
  ('Shire'),
  ('Suffolk Punch'),
  ('Tennessee Walker'),
  ('Thoroughbred'),
  ('Turkoman');
