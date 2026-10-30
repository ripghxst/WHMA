"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { signUp } from "../actions";

export function SignUpForm() {
  const [state, action] = useActionState(signUp, {} as FormState);
  const v = state.values ?? {};
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  if (state.success) {
    return (
      <Alert tone="success" title="Check your email">
        We sent a confirmation link to <strong>{state.success}</strong>. Open it
        to activate your account, then you can register your horses.
      </Alert>
    );
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field
        id="display_name"
        label="Display name"
        hint="Shown on the registry next to your horses."
        error={err("display_name")}
        required
      >
        <Input
          name="display_name"
          defaultValue={v.display_name}
          autoComplete="nickname"
          maxLength={60}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="discord_username"
          label="Discord username"
          error={err("discord_username")}
        >
          <Input
            name="discord_username"
            defaultValue={v.discord_username}
            maxLength={40}
          />
        </Field>
        <Field
          id="in_game_name"
          label="In-game name"
          error={err("in_game_name")}
        >
          <Input
            name="in_game_name"
            defaultValue={v.in_game_name}
            maxLength={60}
          />
        </Field>
      </div>

      <Field id="email" label="Email" error={err("email")} required>
        <Input
          name="email"
          type="email"
          defaultValue={v.email}
          autoComplete="email"
        />
      </Field>

      <Field
        id="password"
        label="Password"
        hint="At least 8 characters."
        error={err("password")}
        required
      >
        <Input name="password" type="password" autoComplete="new-password" />
      </Field>

      <SubmitButton pendingLabel="Creating account…" className="mt-2 w-full">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-saddle">
        Already a member?{" "}
        <Link
          href="/sign-in"
          className="text-rust underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
