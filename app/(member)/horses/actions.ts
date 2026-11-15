"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { applyPhotoManifest } from "@/lib/horse-photos";
import { EDITABLE_STATUSES, MAX_PHOTOS } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";
import {
  horseSchema,
  normalizeParents,
  photoManifestSchema,
  type HorseInput,
  type PhotoManifest,
} from "@/lib/validation/horse";

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Creates a draft, or updates a horse the member can still edit. */
export async function saveHorse(
  input: HorseInput,
  horseId: string | null,
): Promise<SaveResult> {
  const { userId } = await requireUser();

  const parsed = horseSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const values = normalizeParents(parsed.data);

  const supabase = await createClient();

  if (!horseId) {
    const { data, error } = await supabase
      .from("horses")
      .insert({ ...values, owner_id: userId, status: "draft" })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: saveErrorMessage(error) };
    revalidatePath("/dashboard");
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("horses")
    .update(values)
    .eq("id", horseId)
    .eq("owner_id", userId)
    .in("status", EDITABLE_STATUSES)
    .select("id");
  if (error) return { ok: false, error: saveErrorMessage(error) };
  if (!data.length) {
    return { ok: false, error: "This horse can no longer be edited." };
  }
  revalidatePath("/dashboard");
  return { ok: true, id: horseId };
}

function saveErrorMessage(error: { message?: string } | null) {
  // Parent rules from the database (validate_horse_parents trigger).
  if (error?.message?.includes("sire must be a stallion")) {
    return "The selected sire must be a stallion.";
  }
  if (error?.message?.includes("dam must be a mare")) {
    return "The selected dam must be a mare.";
  }
  if (error?.message?.includes("grandparent")) {
    return "A horse can't be its own parent or grandparent.";
  }
  return "Your horse could not be saved. Please try again.";
}

/**
 * Makes the horse's photo rows match the form: removes photos that were taken
 * out (and their files), adds newly uploaded ones, and stores order + primary.
 * New files are uploaded from the browser to `{userId}/{horseId}/…` first.
 */
export async function syncPhotos(
  horseId: string,
  manifest: PhotoManifest,
): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  const parsed = photoManifestSchema.safeParse(manifest);
  const prefix = `${userId}/${horseId}/`;
  if (
    !parsed.success ||
    parsed.data.length > MAX_PHOTOS ||
    parsed.data.some((p) => !p.path.startsWith(prefix))
  ) {
    return { error: "Those photos could not be saved." };
  }

  const supabase = await createClient();
  const { data: horse } = await supabase
    .from("horses")
    .select("status, horse_photos(id, storage_path)")
    .eq("id", horseId)
    .eq("owner_id", userId)
    .single();
  if (!horse || !EDITABLE_STATUSES.includes(horse.status)) {
    return { error: "This horse can no longer be edited." };
  }

  return applyPhotoManifest(supabase, horseId, horse.horse_photos, parsed.data);
}

export type ParentOption = {
  id: string;
  name: string;
  number: string | null;
  breed: string | null;
  classified: boolean;
  foundation: boolean;
};

/**
 * Registered horses (approved or Foundation) of the given sex, by name or WHMA
 * number. With an empty query it returns the first ones alphabetically, so the
 * picker can suggest parents before the member types anything.
 */
export async function searchParents(
  query: string,
  sex: "stallion" | "mare",
  excludeId: string | null,
): Promise<ParentOption[]> {
  await requireUser();
  // Characters with meaning in PostgREST filters are stripped.
  const q = query.replace(/[,()%*\\]/g, " ").trim();

  const supabase = await createClient();
  let request = supabase
    .from("horses")
    .select(
      "id, registered_name, registration_number, is_foundation, breed:breeds!horses_breed_id_fkey(name, is_classified)",
    )
    .eq("status", "approved")
    .eq("sex", sex)
    .order("registered_name")
    .limit(8);
  if (q) {
    request = request.or(
      `registered_name.ilike.%${q}%,registration_number.ilike.%${q}%`,
    );
  }
  if (excludeId) request = request.neq("id", excludeId);

  const { data } = await request;
  return (data ?? []).map((h) => ({
    id: h.id,
    name: h.registered_name,
    number: h.registration_number,
    breed: h.breed?.name ?? null,
    classified: h.breed?.is_classified ?? false,
    foundation: h.is_foundation,
  }));
}
