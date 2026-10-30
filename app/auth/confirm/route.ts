import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route for links in auth emails (sign-up confirmation, password
 * reset). Supports the token_hash links from our email templates and the
 * default ?code= links, then forwards to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(
    searchParams.get("next"),
    type === "recovery" ? "/reset-password" : "/dashboard",
  );

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const target = new URL(ok ? next : "/sign-in", request.url);
  if (ok && type === "signup") target.searchParams.set("welcome", "1");
  if (!ok) target.searchParams.set("error", "link");
  return NextResponse.redirect(target);
}
