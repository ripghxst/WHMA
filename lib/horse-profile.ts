import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * An approved horse with its pedigree and offspring, by WHMA number or id.
 * Returns null for anything not public, so pending horses read as not found.
 * Cached per request: the page and its metadata share one load.
 */
export const loadHorse = cache(async (ref: string) => {
  const supabase = await createClient();

  const { data: horse, error } = await supabase
    .from("horses")
    .select(
      `id, registration_number, registered_name, barn_name, sex, pedigree, phenotype,
       genotype, height, eye_color, base_stats, is_foundation, registration_date,
       reviewed_at, legacy_owner_name,
       breed:breeds!horses_breed_id_fkey(name),
       owner:profiles!horses_owner_id_fkey(id, display_name, in_game_name),
       horse_photos(storage_path, is_primary, sort_order)`,
    )
    .eq(UUID.test(ref) ? "id" : "registration_number", ref)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw error;
  if (!horse) return null;

  const [
    { data: pedigree, error: pedigreeError },
    { data: offspring, error: offspringError },
  ] = await Promise.all([
    supabase
      .from("horse_pedigree")
      .select("*")
      .eq("horse_id", horse.id)
      .maybeSingle(),
    supabase
      .from("horses")
      .select("id, registered_name, registration_number, sex")
      .eq("status", "approved")
      .or(`sire_id.eq.${horse.id},dam_id.eq.${horse.id}`)
      .order("registered_name"),
  ]);
  if (pedigreeError) throw pedigreeError;
  if (offspringError) throw offspringError;

  return { horse, pedigree, offspring };
});

export type HorseProfile = NonNullable<Awaited<ReturnType<typeof loadHorse>>>;
export type HorsePedigree = NonNullable<HorseProfile["pedigree"]>;
