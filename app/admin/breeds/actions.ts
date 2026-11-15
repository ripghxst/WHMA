"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/validation/auth";

const breedSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter the breed name.")
      .max(60, "Use 60 characters or fewer."),
    classified: z.boolean(),
    code: z.string().trim().toUpperCase(),
  })
  .superRefine((v, ctx) => {
    if (v.classified && !/^[A-Z]{2}$/.test(v.code)) {
      ctx.addIssue({
        code: "custom",
        path: ["code"],
        message: "Classified breeds need a two-letter code, e.g. AM.",
      });
    }
  });

export async function addBreed(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const values = {
    name: String(formData.get("name") ?? ""),
    code: String(formData.get("code") ?? ""),
  };
  const parsed = breedSchema.safeParse({
    ...values,
    classified: formData.get("classified") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { name, classified, code } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("breeds").insert({
    name,
    is_classified: classified,
    code: classified ? code : null,
  });
  if (error?.code === "23505") {
    return {
      error: "A breed with that name or code already exists.",
      values,
    };
  }
  if (error) return { error: "The breed could not be added.", values };

  revalidatePath("/", "layout");
  return { success: `${name} added.` };
}
