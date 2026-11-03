"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  EDITABLE_STATUSES,
  PHOTO_BUCKET,
  missingForSubmission,
} from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

export async function submitHorse(horseId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const { data: horse } = await supabase
    .from("horses")
    .select(
      "registered_name, sex, breed_id, phenotype, genotype, base_stats, sire_id, sire_name, dam_id, dam_name, status, horse_photos(count)",
    )
    .eq("id", horseId)
    .eq("owner_id", userId)
    .single();

  if (!horse || !EDITABLE_STATUSES.includes(horse.status)) {
    return { error: "This horse can't be submitted right now." };
  }

  const missing = missingForSubmission(
    horse,
    horse.horse_photos[0]?.count ?? 0,
  );
  if (missing.length) {
    return { error: `Before submitting, add: ${missing.join(", ")}.` };
  }

  const { error } = await supabase
    .from("horses")
    .update({ status: "pending" })
    .eq("id", horseId)
    .eq("owner_id", userId);
  if (error)
    return { error: "The horse could not be submitted. Please try again." };

  revalidatePath("/dashboard");
  return {};
}

export async function deleteHorse(horseId: string): Promise<ActionResult> {
  const { userId } = await requireUser();
  const supabase = await createClient();

  const { data: horse } = await supabase
    .from("horses")
    .select("status, horse_photos(storage_path)")
    .eq("id", horseId)
    .eq("owner_id", userId)
    .single();
  if (!horse || !EDITABLE_STATUSES.includes(horse.status)) {
    return { error: "This horse can't be deleted right now." };
  }

  // The database cascade removes photo rows but not the files. Storage policies
  // only allow deleting files while the horse still exists and is editable,
  // so remove the files first.
  const paths = horse.horse_photos.map((p) => p.storage_path);
  if (paths.length) {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  }

  const { data: deleted, error } = await supabase
    .from("horses")
    .delete()
    .eq("id", horseId)
    .eq("owner_id", userId)
    .in("status", EDITABLE_STATUSES)
    .select("id");
  if (error || !deleted?.length) {
    return { error: "This horse can't be deleted right now." };
  }

  revalidatePath("/dashboard");
  return {};
}
