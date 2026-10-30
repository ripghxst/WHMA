import { z } from "zod";

const email = z.email("Enter a valid email address.").trim().toLowerCase();

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`)
    .transform((v) => v || null);

export const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, "Enter the name other members will see.")
    .max(60, "Display name must be 60 characters or fewer."),
  discord_username: optionalText(40, "Discord username"),
  in_game_name: optionalText(60, "In-game name"),
});

export const signUpSchema = profileSchema.extend({ email, password });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const emailSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The passwords don't match.",
  });

/** Result of a form Server Action, consumed by useActionState. */
export type FormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Submitted values, so the form can be refilled after an error. */
  values?: Record<string, string>;
  success?: string;
  /** Machine-readable outcome for special UI (e.g. "email_not_confirmed"). */
  code?: string;
};

export function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(
    keys.map((k) => [k, String(formData.get(k) ?? "")]),
  );
}
