"use client";

import { useActionState } from "react";

import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { changePassword, updateProfile } from "./actions";

type Profile = {
  display_name: string;
  discord_username: string | null;
  in_game_name: string | null;
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState(updateProfile, {} as FormState);
  const v = state.values ?? {
    display_name: profile.display_name,
    discord_username: profile.discord_username ?? "",
    in_game_name: profile.in_game_name ?? "",
  };
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}

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
      <div>
        <SubmitButton pendingLabel="Saving…">Save profile</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, {} as FormState);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form
      // Clear the fields after a successful change.
      key={state.success ? "done" : "editing"}
      action={action}
      noValidate
      className="flex flex-col gap-5"
    >
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
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
      </div>
      <div>
        <SubmitButton pendingLabel="Saving…" variant="secondary">
          Change password
        </SubmitButton>
      </div>
    </form>
  );
}
