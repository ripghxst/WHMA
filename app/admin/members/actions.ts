"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  formValues,
  profileSchema,
  type FormState,
} from "@/lib/validation/auth";

export async function boardUpdateProfile(
  memberId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
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
    .eq("id", memberId);
  if (error) return { error: "The profile could not be saved.", values };

  revalidatePath("/", "layout");
  return { success: "Profile saved.", values };
}

/** Promote to the board or back to member. Admins can't change their own role. */
export async function setMemberRole(
  memberId: string,
  role: "member" | "admin",
): Promise<{ error?: string }> {
  const { userId } = await requireAdmin();
  if (memberId === userId) return { error: "You can't change your own role." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", memberId);
  if (error) return { error: "The role could not be changed." };

  revalidatePath("/", "layout");
  return {};
}
