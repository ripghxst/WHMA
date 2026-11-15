import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { PHOTO_BUCKET } from "@/lib/horses";
import type { Database } from "@/lib/types/database";
import type { PhotoManifest } from "@/lib/validation/horse";

/**
 * Makes a horse's photo rows match the form: removes photos that were taken
 * out (rows and files), adds new ones, and stores order and the main photo.
 * Callers check who may edit the horse and which paths are allowed first.
 */
export async function applyPhotoManifest(
  supabase: SupabaseClient<Database>,
  horseId: string,
  existing: { id: string; storage_path: string }[],
  manifest: PhotoManifest,
): Promise<{ error?: string }> {
  const keep = new Set(manifest.map((p) => p.path));
  const removed = existing.filter((p) => !keep.has(p.storage_path));
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

  if (manifest.length === 0) return {};
  const { error } = await supabase.from("horse_photos").upsert(
    manifest.map((p, i) => ({
      horse_id: horseId,
      storage_path: p.path,
      sort_order: i,
      is_primary: p.isPrimary,
    })),
    { onConflict: "storage_path" },
  );
  return error ? { error: "The photos could not be saved." } : {};
}
