"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { resendConfirmation, signIn } from "../actions";

export function SignInForm() {
  const params = useSearchParams();
  const [state, action] = useActionState(signIn, {} as FormState);
  const [resendState, resend, resending] = useActionState(
    resendConfirmation,
    {} as FormState,
  );
  const err = (k: string) => state.fieldErrors?.[k]?.[0];
  const email = state.values?.email ?? "";

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {params.get("error") === "link" && !state.error && (
        <Alert tone="error" title="That link didn't work">
          It may have expired or already been used. Sign in, or request a new
          link.
        </Alert>
      )}

      {state.error && (
        <Alert tone="error">
          {state.error}
          {state.code === "email_not_confirmed" && (
            <div className="mt-3">
              {resendState.success ? (
                <p className="text-sm text-approved">{resendState.success}</p>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  formAction={resend}
                  disabled={resending}
                >
                  {resending ? "Sending…" : "Resend confirmation email"}
                </Button>
              )}
              {resendState.error && (
                <p className="mt-2 text-sm text-rejected">
                  {resendState.error}
                </p>
              )}
            </div>
          )}
        </Alert>
      )}

      <input type="hidden" name="next" value={params.get("next") ?? ""} />

      <Field id="email" label="Email" error={err("email")} required>
        <Input
          name="email"
          type="email"
          defaultValue={email}
          autoComplete="email"
        />
      </Field>

      <Field id="password" label="Password" error={err("password")} required>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </Field>

      <div className="-mt-2 text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-rust underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <SubmitButton pendingLabel="Signing in…" className="w-full">
        Sign in
      </SubmitButton>

      <p className="text-center text-sm text-saddle">
        New to the registry?{" "}
        <Link
          href="/sign-up"
          className="text-rust underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
