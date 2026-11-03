import "server-only";

import { createClient } from "@/lib/supabase/server";

/** All breeds for selects, classified first. */
export async function loadBreeds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("breeds")
    .select("id, name, is_classified")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data;
}
