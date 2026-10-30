import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import type { Database } from "@/lib/types/database";

/** Routes that need a signed-in member. Admin rights are checked in app/admin. */
const protectedPrefixes = ["/dashboard", "/account", "/horses/new", "/admin"];
const editHorsePath = /^\/horses\/[^/]+\/edit$/;

/** Signed-in members are sent on from these to their dashboard. */
const guestOnlyPaths = ["/sign-in", "/sign-up"];

function isProtected(path: string) {
  return (
    protectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`)) ||
    editHorsePath.test(path)
  );
}

/**
 * Refreshes the Supabase auth session, keeps the auth cookies in sync
 * between the request and the response, and gates member-only routes.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims():
  // it validates the JWT and triggers the token refresh.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);
  const path = request.nextUrl.pathname;

  let redirectTo: URL | null = null;
  if (!signedIn && isProtected(path)) {
    redirectTo = new URL("/sign-in", request.url);
    redirectTo.searchParams.set("next", path + request.nextUrl.search);
  } else if (signedIn && guestOnlyPaths.includes(path)) {
    redirectTo = new URL("/dashboard", request.url);
  }

  if (redirectTo) {
    const redirect = NextResponse.redirect(redirectTo);
    // Keep any refreshed session cookies.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}
