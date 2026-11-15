"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { SaveResult } from "@/app/(member)/horses/actions";
import type { HorseFormInput } from "@/app/(member)/horses/horse-form";
import { requireAdmin } from "@/lib/auth";
import { applyPhotoManifest } from "@/lib/horse-photos";
import { MAX_PHOTOS, PHOTO_BUCKET } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";
import {
  boardSchema,
  horseSchema,
  normalizeParents,
  photoManifestSchema,
  type PhotoManifest,
} from "@/lib/validation/horse";

/** Readable names for the history note, e.g. "Changed: coat, WHMA number". */
const fieldLabels: Record<string, string> = {
  registered_name: "registered name",
  barn_name: "barn name",
  sex: "sex",
  breed_id: "breed",
  pedigree: "pedigree",
  phenotype: "coat",
  genotype: "genotype",
  height: "height",
  eye_color: "eye colour",
  base_stats: "base stats",
  sire_id: "sire",
  sire_name: "sire",
  sire_breed_id: "sire",
  dam_id: "dam",
  dam_name: "dam",
  dam_breed_id: "dam",
  registration_number: "WHMA number",
  owner_id: "owner",
  is_foundation: "Foundation flag",
  registration_date: "registration date",
};

function revalidatePublic() {
  revalidatePath("/", "layout");
}

function boardError(error: { code?: string; message?: string }): SaveResult {
  if (error.code === "23505") {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: {
        registration_number: ["That WHMA number is already in use."],
      },
    };
  }
  if (error.message?.includes("sire must be a stallion")) {
    return { ok: false, error: "The selected sire must be a stallion." };
  }
  if (error.message?.includes("dam must be a mare")) {
    return { ok: false, error: "The selected dam must be a mare." };
  }
  if (error.message?.includes("grandparent")) {
    return {
      ok: false,
      error: "A horse can't be its own parent or grandparent.",
    };
  }
  return {
    ok: false,
    error: "The horse could not be saved. Please try again.",
  };
}

/**
 * Board edit of any horse, or creation of a Foundation horse (approved
 * straight away, no owner). Every save is written to the horse's history.
 */
export async function boardSaveHorse(
  input: HorseFormInput,
  horseId: string | null,
): Promise<SaveResult> {
  const { userId } = await requireAdmin();

  const horse = horseSchema.safeParse(input);
  const board = boardSchema.safeParse(input.board);
  if (!horse.success || !board.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: {
        ...(horse.success ? {} : z.flattenError(horse.error).fieldErrors),
        ...(board.success ? {} : z.flattenError(board.error).fieldErrors),
      },
    };
  }
  const values = { ...normalizeParents(horse.data), ...board.data };
  const supabase = await createClient();

  if (!horseId) {
    const { data, error } = await supabase
      .from("horses")
      .insert({
        ...values,
        status: "approved",
        registration_date:
          values.registration_date ?? new Date().toISOString().slice(0, 10),
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !data) return boardError(error ?? {});
    await supabase.from("horse_reviews").insert({
      horse_id: data.id,
      actor_id: userId,
      action: "edited",
      note: "Added to the registry by the board.",
    });
    revalidatePublic();
    return { ok: true, id: data.id };
  }

  const { data: before } = await supabase
    .from("horses")
    .select("*")
    .eq("id", horseId)
    .single();
  if (!before) return { ok: false, error: "This horse no longer exists." };

  const { error } = await supabase
    .from("horses")
    .update(values)
    .eq("id", horseId);
  if (error) return boardError(error);

  const changed = [
    ...new Set(
      Object.entries(values)
        .filter(([k, v]) => (before as Record<string, unknown>)[k] !== v)
        .map(([k]) => fieldLabels[k] ?? k),
    ),
  ];
  if (changed.length) {
    await supabase.from("horse_reviews").insert({
      horse_id: horseId,
      actor_id: userId,
      action: "edited",
      note: `Changed: ${changed.join(", ")}.`,
    });
  }
  revalidatePublic();
  return { ok: true, id: horseId };
}

/** Board version of the photo sync: any horse; new uploads live under board/{horseId}/. */
export async function boardSyncPhotos(
  horseId: string,
  manifest: PhotoManifest,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: horse } = await supabase
    .from("horses")
    .select("horse_photos(id, storage_path)")
    .eq("id", horseId)
    .single();
  if (!horse) return { error: "This horse no longer exists." };

  const parsed = photoManifestSchema.safeParse(manifest);
  const existing = new Set(horse.horse_photos.map((p) => p.storage_path));
  if (
    !parsed.success ||
    parsed.data.length > MAX_PHOTOS ||
    parsed.data.some(
      (p) => !existing.has(p.path) && !p.path.startsWith(`board/${horseId}/`),
    )
  ) {
    return { error: "Those photos could not be saved." };
  }

  const result = await applyPhotoManifest(
    supabase,
    horseId,
    horse.horse_photos,
    parsed.data,
  );
  revalidatePublic();
  return result;
}

/**
 * Deletes a horse and its photo files. Offspring keep the name and breed as a
 * typed-in parent (database trigger), so their pedigrees don't break.
 */
export async function boardDeleteHorse(
  horseId: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: photos } = await supabase
    .from("horse_photos")
    .select("storage_path")
    .eq("horse_id", horseId);

  const { error } = await supabase.from("horses").delete().eq("id", horseId);
  if (error) return { error: "The horse could not be deleted." };

  if (photos?.length) {
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove(photos.map((p) => p.storage_path));
  }
  revalidatePublic();
  return {};
}
