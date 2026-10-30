"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { updatePassword } from "../actions";

/** Reached from the password reset email, which signs the member in first. */
export default function ResetPasswordPage() {
  const [state, action] = useActionState(updatePassword, {} as FormState);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <>
      <title>Choose a new password · WHMA Horse Registry</title>
      <AuthHeading title="New password">
        Choose a new password for your account.
      </AuthHeading>

      <form action={action} noValidate className="flex flex-col gap-5">
        {state.error && (
          <Alert tone="error">
            {state.error}
            {state.code === "no_session" && (
              <>
                {" "}
                <Link
                  href="/forgot-password"
                  className="underline underline-offset-4"
                >
                  Request a new link
                </Link>
              </>
            )}
          </Alert>
        )}
        <Field
          id="password"
          label="New password"
          hint="At least 8 characters."
          error={err("password")}
          required
        >
          <Input name="password" type="password" autoComplete="new-password" />
        </Field>
        <Field
          id="confirm"
          label="Confirm new password"
          error={err("confirm")}
          required
        >
          <Input name="confirm" type="password" autoComplete="new-password" />
        </Field>
        <SubmitButton pendingLabel="Saving…" className="w-full">
          Save new password
        </SubmitButton>
      </form>
    </>
  );
}
