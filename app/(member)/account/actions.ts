"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authErrorMessage, requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formValues,
  newPasswordSchema,
  profileSchema,
  type FormState,
} from "@/lib/validation/auth";

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser("/account");
  const values = formValues(formData, [
    "display_name",
    "discord_username",
    "in_game_name",
  ]);
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", session.userId);
  if (error) return { error: "Your profile could not be saved.", values };

  revalidatePath("/", "layout");
  return { success: "Profile saved.", values };
}

export async function changePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser("/account");
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: authErrorMessage(error) };

  return { success: "Password changed." };
}
