import "server-only";

import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const PAGE_SIZE = 24;

const SORTS = ["newest", "name", "number"] as const;
const SEXES = ["stallion", "mare", "gelding"] as const;

export type RegistrySort = (typeof SORTS)[number];
export type RegistrySex = (typeof SEXES)[number];

export type RegistryFilters = {
  q: string;
  breed: number | null;
  sex: RegistrySex | null;
  foundation: boolean;
  sort: RegistrySort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

/** Reads filters from the URL; anything invalid falls back to the default. */
export function parseFilters(params: RawParams): RegistryFilters {
  const breed = Number(first(params.breed));
  const page = Number(first(params.page));
  const sex = first(params.sex) as RegistrySex;
  const sort = first(params.sort) as RegistrySort;
  return {
    q: first(params.q).trim().slice(0, 120),
    breed: Number.isInteger(breed) && breed > 0 ? breed : null,
    sex: SEXES.includes(sex) ? sex : null,
    foundation: first(params.foundation) === "1",
    sort: SORTS.includes(sort) ? sort : "newest",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Builds a /registry URL for these filters, leaving out defaults. */
export function registryHref(filters: RegistryFilters, page = filters.page) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.breed) params.set("breed", String(filters.breed));
  if (filters.sex) params.set("sex", filters.sex);
  if (filters.foundation) params.set("foundation", "1");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/registry?${query}` : "/registry";
}

const COLUMNS = `id, registered_name, barn_name, registration_number, sex, phenotype,
  registration_date, reviewed_at, is_foundation, legacy_owner_name,
  breed:breeds!horses_breed_id_fkey(name),
  owner:profiles!horses_owner_id_fkey(display_name, in_game_name),
  horse_photos(storage_path, is_primary, sort_order)`;

/** Approved horses matching the filters, plus the total for pagination. */
export async function listRegistry(filters: RegistryFilters) {
  await connection();
  const supabase = await createClient();

  let query = supabase
    .from("horses")
    .select(COLUMNS, { count: "exact" })
    .eq("status", "approved");

  // Characters with meaning in PostgREST filters are stripped.
  const q = filters.q.replace(/[,()%*\\]/g, " ").trim();
  if (q) {
    query = query.or(
      `registered_name.ilike.%${q}%,barn_name.ilike.%${q}%,registration_number.ilike.%${q}%`,
    );
  }
  if (filters.breed) query = query.eq("breed_id", filters.breed);
  if (filters.sex) query = query.eq("sex", filters.sex);
  if (filters.foundation) query = query.eq("is_foundation", true);

  if (filters.sort === "name") {
    query = query.order("registered_name");
  } else if (filters.sort === "number") {
    query = query.order("registration_number", { nullsFirst: false });
  } else {
    query = query
      .order("registration_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1);

  // PGRST103: the requested page is past the last result.
  if (error?.code === "PGRST103") {
    return { horses: [], total: 0, outOfRange: true };
  }
  if (error) throw error;
  return { horses: data, total: count ?? 0, outOfRange: false };
}

export type RegistryHorse = Awaited<
  ReturnType<typeof listRegistry>
>["horses"][number];

/** The latest approved horses, for the home page. */
export async function recentRegistrations(limit: number) {
  const { horses } = await listRegistry({
    q: "",
    breed: null,
    sex: null,
    foundation: false,
    sort: "newest",
    page: 1,
  });
  return horses.slice(0, limit);
}

/** Who to show as the owner: in-game name, display name, or the imported name. */
export function ownerName(horse: RegistryHorse) {
  if (horse.owner) return horse.owner.in_game_name ?? horse.owner.display_name;
  if (horse.legacy_owner_name) return horse.legacy_owner_name;
  return horse.is_foundation ? "WHMA Foundation" : null;
}

export function registeredOn(horse: RegistryHorse) {
  return horse.registration_date ?? horse.reviewed_at;
}
