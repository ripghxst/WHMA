"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = {
  error?: string;
  fieldErrors?: Partial<Record<"decision" | "number" | "note", string>>;
  values?: { decision?: string; number?: string; note?: string };
};

const NUMBER = /^WHMA-[A-Z]{2}[12]?-[0-9]{6}$/;

const reviewSchema = z
  .object({
    decision: z.enum(["approved", "changes_requested", "rejected"], {
      error: "Choose a decision.",
    }),
    number: z.string().trim().toUpperCase(),
    note: z.string().trim().max(2000, "Keep the note under 2000 characters."),
  })
  .superRefine((v, ctx) => {
    if (v.decision === "approved" && !NUMBER.test(v.number)) {
      ctx.addIssue({
        code: "custom",
        path: ["number"],
        message: "Use the format WHMA-AM2-123456.",
      });
    }
    if (v.decision !== "approved" && !v.note) {
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message:
          v.decision === "rejected"
            ? "Give the member a reason for the denial."
            : "Tell the member what to change.",
      });
    }
  });

export async function reviewHorse(
  horseId: string,
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  await requireAdmin();

  const values = {
    decision: String(formData.get("decision") ?? ""),
    number: String(formData.get("number") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    return {
      values,
      fieldErrors: {
        decision: errors.decision?.[0],
        number: errors.number?.[0],
        note: errors.note?.[0],
      },
    };
  }

  const { decision, number, note } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_horse", {
    p_horse_id: horseId,
    p_action: decision,
    p_note: note || undefined,
    p_registration_number: decision === "approved" ? number : undefined,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        values,
        fieldErrors: { number: "That WHMA number is already in use." },
      };
    }
    return {
      values,
      error: error.message.includes("not waiting for review")
        ? "This horse has already been reviewed."
        : "The decision could not be saved. Please try again.",
    };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/registry");
  revalidatePath("/dashboard");
  redirect(`/admin/review?done=${decision}`);
}
