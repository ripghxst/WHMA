import { env } from "@/lib/env";
import type { Enums, Tables } from "@/lib/types/database";

export type HorseStatus = Enums<"horse_status">;

export const PHOTO_BUCKET = "horse-photos";

/** Public URL for a file in the horse-photos bucket. */
export function photoUrl(storagePath: string) {
  return `${env.supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${storagePath}`;
}

/** The photo to show for a horse: the primary one, else the first by order. */
export function primaryPhoto(
  photos: Pick<
    Tables<"horse_photos">,
    "storage_path" | "is_primary" | "sort_order"
  >[],
) {
  return (
    photos.find((p) => p.is_primary) ??
    [...photos].sort((a, b) => a.sort_order - b.sort_order)[0] ??
    null
  );
}

const sexLabels: Record<Enums<"horse_sex">, string> = {
  stallion: "Stallion",
  mare: "Mare",
  gelding: "Gelding",
};

export function sexLabel(sex: Enums<"horse_sex"> | null) {
  return sex ? sexLabels[sex] : null;
}

/** Statuses a member can still edit, submit or delete. */
export const EDITABLE_STATUSES: HorseStatus[] = ["draft", "changes_requested"];

export function isEditable(status: HorseStatus) {
  return EDITABLE_STATUSES.includes(status);
}

type SubmissionFields = Pick<
  Tables<"horses">,
  | "registered_name"
  | "sex"
  | "breed_id"
  | "phenotype"
  | "genotype"
  | "base_stats"
  | "sire_id"
  | "sire_name"
  | "dam_id"
  | "dam_name"
>;

/**
 * What's still missing before a horse can be submitted for review.
 * Shared by the dashboard Submit action and the registration form (T07).
 */
export function missingForSubmission(
  horse: SubmissionFields,
  photoCount: number,
) {
  const missing: string[] = [];
  if (!horse.registered_name?.trim()) missing.push("registered name");
  if (!horse.sex) missing.push("sex");
  if (!horse.breed_id) missing.push("listed breed");
  if (!horse.phenotype?.trim()) missing.push("coat (phenotype)");
  if (!horse.genotype?.trim()) missing.push("genotype");
  if (!horse.base_stats?.trim()) missing.push("base stats");
  if (!horse.sire_id && !horse.sire_name?.trim()) missing.push("sire");
  if (!horse.dam_id && !horse.dam_name?.trim()) missing.push("dam");
  if (photoCount < 1) missing.push("at least one photo");
  return missing;
}
