import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Public profile fields only. Profiles never hold emails; this is the full list we show. */
const PROFILE_COLUMNS =
  "id, display_name, in_game_name, discord_username, role";

/** Members with at least one approved horse, with their horse count, A to Z. */
export async function listMembers(query: string) {
  const supabase = await createClient();

  // Few members, so counting approved horses per owner in code is simplest.
  const { data: owned, error } = await supabase
    .from("horses")
    .select("owner_id")
    .eq("status", "approved")
    .not("owner_id", "is", null);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const { owner_id } of owned) {
    if (owner_id) counts.set(owner_id, (counts.get(owner_id) ?? 0) + 1);
  }
  if (counts.size === 0) return [];

  let request = supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .in("id", [...counts.keys()])
    .order("display_name");

  // Characters with meaning in PostgREST filters are stripped.
  const q = query.replace(/[,()%*\\]/g, " ").trim();
  if (q) {
    request = request.or(
      `display_name.ilike.%${q}%,in_game_name.ilike.%${q}%,discord_username.ilike.%${q}%`,
    );
  }

  const { data: profiles, error: profileError } = await request;
  if (profileError) throw profileError;
  return profiles.map((p) => ({ ...p, horseCount: counts.get(p.id) ?? 0 }));
}

export type Member = Awaited<ReturnType<typeof listMembers>>[number];

/** One member's public profile, or null. Cached per request (page + metadata). */
export const loadMember = cache(async (id: string) => {
  if (!UUID.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
});
