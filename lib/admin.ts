import "server-only";

import { requireAdmin } from "@/lib/auth";
import type { HorseStatus } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Number of horses in each status. */
export async function statusCounts() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.from("horses").select("status");
  if (error) throw error;

  const counts: Record<HorseStatus, number> = {
    draft: 0,
    pending: 0,
    changes_requested: 0,
    approved: 0,
    rejected: 0,
  };
  for (const { status } of data) counts[status] += 1;
  return counts;
}

/** Horses waiting for review, oldest submission first. */
export async function listPending(limit?: number) {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("horses")
    .select(
      `id, registered_name, sex, submitted_at,
       breed:breeds!horses_breed_id_fkey(name),
       owner:profiles!horses_owner_id_fkey(display_name, in_game_name, discord_username),
       horse_photos(storage_path, is_primary, sort_order)`,
    )
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export type PendingHorse = Awaited<ReturnType<typeof listPending>>[number];

/**
 * Everything the board needs to decide on one horse: the record, owner,
 * pedigree, review history, and the WHMA number it would receive (or why it
 * isn't eligible).
 */
export async function loadSubmission(id: string) {
  await requireAdmin();
  if (!UUID.test(id)) return null;
  const supabase = await createClient();

  const { data: horse, error } = await supabase
    .from("horses")
    .select(
      `*, breed:breeds!horses_breed_id_fkey(name),
       owner:profiles!horses_owner_id_fkey(id, display_name, in_game_name, discord_username),
       horse_photos(storage_path, is_primary, sort_order)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!horse) return null;

  const [pedigree, history, proposed] = await Promise.all([
    supabase
      .from("horse_pedigree")
      .select("*")
      .eq("horse_id", id)
      .maybeSingle(),
    supabase
      .from("horse_reviews")
      .select(
        "id, action, note, created_at, actor:profiles!horse_reviews_actor_id_fkey(display_name)",
      )
      .eq("horse_id", id)
      .order("created_at", { ascending: false }),
    horse.status === "pending"
      ? supabase.rpc("generate_registration_number", { p_horse_id: id })
      : Promise.resolve(null),
  ]);
  if (pedigree.error) throw pedigree.error;
  if (history.error) throw history.error;

  return {
    horse,
    pedigree: pedigree.data,
    history: history.data,
    /** Proposed WHMA number, or null with `ineligible` set when no parent is classified. */
    proposedNumber: proposed?.data ?? null,
    ineligible: Boolean(proposed?.error),
  };
}
