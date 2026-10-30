"use client";

import Link from "next/link";
import { useActionState } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { requestPasswordReset } from "../actions";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, {} as FormState);

  return (
    <>
      <title>Reset your password · WHMA Horse Registry</title>
      <AuthHeading title="Reset password">
        Enter the email you signed up with and we&apos;ll send you a link to
        choose a new password.
      </AuthHeading>

      {state.success ? (
        <Alert tone="success" title="Check your email">
          If an account exists for <strong>{state.success}</strong>, a reset
          link is on its way. It expires after one hour.
        </Alert>
      ) : (
        <form action={action} noValidate className="flex flex-col gap-5">
          {state.error && <Alert tone="error">{state.error}</Alert>}
          <Field
            id="email"
            label="Email"
            error={state.fieldErrors?.email?.[0]}
            required
          >
            <Input
              name="email"
              type="email"
              defaultValue={state.values?.email}
              autoComplete="email"
            />
          </Field>
          <SubmitButton pendingLabel="Sending…" className="w-full">
            Send reset link
          </SubmitButton>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-saddle">
        <Link
          href="/sign-in"
          className="text-rust underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
