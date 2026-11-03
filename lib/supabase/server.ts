import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Server Components, Server Functions and Route Handlers.
 * Create a new one per request; never share it between requests.
 */
export async function createClient() {
  // Supabase calls are request-time work: the auth client reads the clock,
  // which Next only allows after this marker.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Safe to ignore: proxy.ts refreshes the session on every request.
          }
        },
      },
    },
  );
}
