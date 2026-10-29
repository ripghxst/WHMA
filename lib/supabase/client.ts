import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";

/** Supabase client for Client Components. */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
