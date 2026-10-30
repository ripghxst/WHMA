"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { authErrorMessage, safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  emailSchema,
  formValues,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
  type FormState,
} from "@/lib/validation/auth";

/** Absolute URL of /auth/confirm, where links in auth emails land. */
async function confirmUrl(next: string) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "";
  return `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function signUp(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, [
    "display_name",
    "discord_username",
    "in_game_name",
    "email",
  ]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, password, ...profile } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: await confirmUrl("/dashboard"),
      // Copied into public.profiles by the handle_new_user trigger.
      data: profile,
    },
  });

  if (error) return { error: authErrorMessage(error), values };

  // Supabase hides existing accounts by returning a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: "An account with this email already exists. Sign in instead.",
      values,
    };
  }

  return { success: email };
}

export async function signIn(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: authErrorMessage(error), code: error.code, values };
  }

  redirect(safeNext(formData.get("next")));
}

export async function resendConfirmation(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter your email address first." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: await confirmUrl("/dashboard") },
  });
  if (error) return { error: authErrorMessage(error) };

  return { success: "We've sent a new confirmation link." };
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: await confirmUrl("/reset-password") },
  );
  // Rate limits are worth reporting; anything else gets the same answer so the
  // form can't be used to find out which emails have accounts.
  if (error?.code?.startsWith("over_")) {
    return { error: authErrorMessage(error), values };
  }

  return { success: parsed.data.email };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    return {
      error: "Your reset link has expired. Please request a new one.",
      code: "no_session",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: authErrorMessage(error) };

  redirect("/dashboard?password=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
