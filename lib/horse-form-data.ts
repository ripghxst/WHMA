import "server-only";

import type { ParentOption } from "@/app/(member)/horses/actions";
import type { ParentValue } from "@/app/(member)/horses/parent-field";
import type { PhotoItem } from "@/app/(member)/horses/photo-field";
import { photoUrl } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";
import type { HorseInput } from "@/lib/validation/horse";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parentColumns =
  "id, registered_name, registration_number, is_foundation, breed:breeds!horses_breed_id_fkey(name, is_classified)";

type LinkedParent = {
  id: string;
  registered_name: string;
  registration_number: string | null;
  is_foundation: boolean;
  breed: { name: string; is_classified: boolean } | null;
};

function toParent(
  // Many-to-one self joins come back as an object; the generated types say array.
  joined: LinkedParent | LinkedParent[] | null,
  name: string | null,
  breedId: number | null,
): ParentValue {
  const linked = Array.isArray(joined) ? (joined[0] ?? null) : joined;
  const option: ParentOption | null = linked && {
    id: linked.id,
    name: linked.registered_name,
    number: linked.registration_number,
    breed: linked.breed?.name ?? null,
    classified: linked.breed?.is_classified ?? false,
    foundation: linked.is_foundation,
  };
  return { linked: option, name: name ?? "", breedId };
}

/**
 * A horse plus the starting values for the horse form. Pass `ownerId` to only
 * find the member's own horse; the board omits it (RLS still applies).
 */
export async function loadHorseForForm(id: string, ownerId?: string) {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();

  // Self-joins embed by column (sire_id / dam_id); a constraint hint is ambiguous here.
  let query = supabase
    .from("horses")
    .select(
      `*, horse_photos(storage_path, is_primary, sort_order),
       sire:sire_id(${parentColumns}),
       dam:dam_id(${parentColumns})`,
    )
    .eq("id", id);
  if (ownerId) query = query.eq("owner_id", ownerId);

  const { data: horse, error } = await query.maybeSingle();
  if (error) throw error;
  if (!horse) return null;

  const photos: PhotoItem[] = [...horse.horse_photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      key: p.storage_path,
      kind: "existing",
      path: p.storage_path,
      url: photoUrl(p.storage_path),
    }));

  const initial: HorseInput = {
    registered_name: horse.registered_name,
    barn_name: horse.barn_name,
    sex: horse.sex,
    breed_id: horse.breed_id,
    pedigree: horse.pedigree,
    phenotype: horse.phenotype,
    genotype: horse.genotype,
    height: horse.height,
    eye_color: horse.eye_color,
    base_stats: horse.base_stats,
    sire_id: horse.sire_id,
    sire_name: horse.sire_name,
    sire_breed_id: horse.sire_breed_id,
    dam_id: horse.dam_id,
    dam_name: horse.dam_name,
    dam_breed_id: horse.dam_breed_id,
  };

  return {
    horse,
    initial,
    initialSire: toParent(horse.sire, horse.sire_name, horse.sire_breed_id),
    initialDam: toParent(horse.dam, horse.dam_name, horse.dam_breed_id),
    initialPhotos: photos,
    initialPrimaryKey:
      horse.horse_photos.find((p) => p.is_primary)?.storage_path ??
      photos[0]?.key ??
      null,
  };
}
