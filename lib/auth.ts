import "server-only";

import type { AuthError } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * The signed-in member and their profile, or null. Cached per request, so
 * the header, layouts and pages can all call it without extra queries.
 */
export const getSession = cache(async () => {
  // Session checks are request-time work (getClaims reads the clock).
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, discord_username, in_game_name, role")
    .eq("id", claims.sub)
    .single();

  if (!profile) return null;

  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    profile,
    isAdmin: profile.role === "admin",
  };
});

export type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/** For member pages and Server Functions: redirects to sign-in when signed out. */
export async function requireUser(next = "/dashboard"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}

/** For admin pages and Server Functions: non-admins get a 404. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session?.isAdmin) notFound();
  return session;
}

/** Only allow same-site relative paths as a post-login destination. */
export function safeNext(value: unknown, fallback = "/dashboard") {
  return typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//")
    ? value
    : fallback;
}

/** Plain-language messages for Supabase Auth errors. */
export function authErrorMessage(error: AuthError) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match. Please try again.";
    case "email_not_confirmed":
      return "Please confirm your email address first. Check your inbox for the link we sent.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Sign in instead.";
    case "weak_password":
      return "That password is too easy to guess. Please choose a stronger one.";
    case "same_password":
      return "Your new password must be different from the current one.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "email_address_not_authorized":
      return "We couldn't send an email to this address yet. Please contact the registration team.";
    case "otp_expired":
      return "This link has expired. Please request a new one.";
    default:
      return "Something went wrong. Please try again.";
  }
}
