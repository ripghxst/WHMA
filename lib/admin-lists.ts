import "server-only";

import { requireAdmin } from "@/lib/auth";
import type { HorseStatus } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_PAGE_SIZE = 30;

const STATUSES: HorseStatus[] = [
  "draft",
  "pending",
  "changes_requested",
  "approved",
  "rejected",
];

/** Strips characters with meaning in PostgREST filters. */
const clean = (q: string) => q.replace(/[,()%*\\]/g, " ").trim();

/** Every horse, any status, for the board. */
export async function listAllHorses(params: {
  q: string;
  status: string;
  owner: string;
  page: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase.from("horses").select(
    `id, registered_name, barn_name, registration_number, status, is_foundation,
       legacy_owner_name, updated_at,
       owner:profiles!horses_owner_id_fkey(display_name),
       horse_photos(storage_path, is_primary, sort_order)`,
    { count: "exact" },
  );
  const q = clean(params.q);
  if (q) {
    query = query.or(
      `registered_name.ilike.%${q}%,barn_name.ilike.%${q}%,registration_number.ilike.%${q}%,legacy_owner_name.ilike.%${q}%`,
    );
  }
  if (STATUSES.includes(params.status as HorseStatus)) {
    query = query.eq("status", params.status as HorseStatus);
  }
  if (params.owner) query = query.eq("owner_id", params.owner);

  const from = (params.page - 1) * ADMIN_PAGE_SIZE;
  const { data, count, error } = await query
    .order("updated_at", { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (error?.code === "PGRST103") return { horses: [], total: 0 };
  if (error) throw error;
  return { horses: data, total: count ?? 0 };
}

/** All member accounts with how many horses each has (any status). */
export async function listAllMembers(q: string) {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, in_game_name, discord_username, role, created_at, horses!horses_owner_id_fkey(count)",
    )
    .order("display_name");
  const term = clean(q);
  if (term) {
    query = query.or(
      `display_name.ilike.%${term}%,in_game_name.ilike.%${term}%,discord_username.ilike.%${term}%`,
    );
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map((m) => ({ ...m, horseCount: m.horses[0]?.count ?? 0 }));
}

/** Owner choices for the board's horse form. */
export async function memberOptions() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, in_game_name")
    .order("display_name");
  if (error) throw error;
  return data.map((m) => ({
    id: m.id,
    name: m.in_game_name
      ? `${m.display_name} (${m.in_game_name})`
      : m.display_name,
  }));
}
