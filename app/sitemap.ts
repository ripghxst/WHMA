import type { MetadataRoute } from "next";

import { horseHref } from "@/lib/horses";
import { site } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/** Public pages plus every approved horse and member, generated per request. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: horses } = await supabase
    .from("horses")
    .select("id, registration_number, owner_id, updated_at")
    .eq("status", "approved");

  const owners = new Set(
    (horses ?? []).map((h) => h.owner_id).filter((id): id is string => !!id),
  );

  return [
    { url: site.url, changeFrequency: "daily", priority: 1 },
    { url: `${site.url}/registry`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site.url}/members`, changeFrequency: "weekly", priority: 0.6 },
    ...(horses ?? []).map((h) => ({
      url: `${site.url}${horseHref(h)}`,
      lastModified: h.updated_at,
      priority: 0.7,
    })),
    ...[...owners].map((id) => ({
      url: `${site.url}/members/${id}`,
      priority: 0.4,
    })),
  ];
}
