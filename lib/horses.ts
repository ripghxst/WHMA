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

/** Public profile URL: by WHMA number, or by id for horses without one (Foundation). */
export function horseHref(horse: {
  id: string;
  registration_number: string | null;
}) {
  return `/horses/${horse.registration_number ?? horse.id}`;
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

export type MissingField = { field: string; label: string };

/**
 * What's still missing before a horse can be submitted for review, by form field.
 * Shared by the dashboard Submit action and the registration form.
 */
export function missingForSubmission(
  horse: SubmissionFields,
  photoCount: number,
): MissingField[] {
  const missing: MissingField[] = [];
  const need = (ok: unknown, field: string, label: string) => {
    if (!ok) missing.push({ field, label });
  };
  need(horse.registered_name?.trim(), "registered_name", "registered name");
  need(horse.sex, "sex", "sex");
  need(horse.breed_id, "breed_id", "listed breed");
  need(horse.phenotype?.trim(), "phenotype", "coat (phenotype)");
  need(horse.genotype?.trim(), "genotype", "genotype");
  need(horse.base_stats?.trim(), "base_stats", "base stats");
  need(horse.sire_id || horse.sire_name?.trim(), "sire", "sire");
  need(horse.dam_id || horse.dam_name?.trim(), "dam", "dam");
  need(photoCount > 0, "photos", "at least one photo");
  return missing;
}

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
