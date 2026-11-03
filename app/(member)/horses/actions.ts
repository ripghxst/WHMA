"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { EDITABLE_STATUSES, MAX_PHOTOS, PHOTO_BUCKET } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";
import {
  horseSchema,
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

  // A linked parent replaces the manual name/breed, so keep only one of them.
  const v = parsed.data;
  const values = {
    ...v,
    sire_name: v.sire_id ? null : v.sire_name,
    sire_breed_id: v.sire_id ? null : v.sire_breed_id,
    dam_name: v.dam_id ? null : v.dam_name,
    dam_breed_id: v.dam_id ? null : v.dam_breed_id,
  };

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

  const keep = new Set(parsed.data.map((p) => p.path));
  const removed = horse.horse_photos.filter((p) => !keep.has(p.storage_path));
  if (removed.length) {
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove(removed.map((p) => p.storage_path));
    await supabase
      .from("horse_photos")
      .delete()
      .in(
        "id",
        removed.map((p) => p.id),
      );
  }

  // Clear the primary flag first: only one photo per horse may hold it.
  await supabase
    .from("horse_photos")
    .update({ is_primary: false })
    .eq("horse_id", horseId);

  const { error } = await supabase.from("horse_photos").upsert(
    parsed.data.map((p, i) => ({
      horse_id: horseId,
      storage_path: p.path,
      sort_order: i,
      is_primary: p.isPrimary,
    })),
    { onConflict: "storage_path" },
  );
  if (error) return { error: "Your photos could not be saved." };

  return {};
}

export type ParentOption = {
  id: string;
  name: string;
  number: string | null;
  breed: string | null;
  classified: boolean;
  foundation: boolean;
};

/** Registered horses (approved or Foundation) of the given sex, by name or WHMA number. */
export async function searchParents(
  query: string,
  sex: "stallion" | "mare",
  excludeId: string | null,
): Promise<ParentOption[]> {
  await requireUser();
  // Characters with meaning in PostgREST filters are stripped.
  const q = query.replace(/[,()%*\\]/g, " ").trim();
  if (q.length < 2) return [];

  const supabase = await createClient();
  let request = supabase
    .from("horses")
    .select(
      "id, registered_name, registration_number, is_foundation, breed:breeds!horses_breed_id_fkey(name, is_classified)",
    )
    .eq("status", "approved")
    .eq("sex", sex)
    .or(`registered_name.ilike.%${q}%,registration_number.ilike.%${q}%`)
    .order("registered_name")
    .limit(8);
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
