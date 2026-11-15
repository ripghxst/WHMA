"use client";

import { useActionState, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

type Profile = {
  display_name: string;
  discord_username: string | null;
  in_game_name: string | null;
};

export function BoardProfileForm({
  profile,
  action,
}: {
  profile: Profile;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, {});
  const v = state.values ?? {
    display_name: profile.display_name,
    discord_username: profile.discord_username ?? "",
    in_game_name: profile.in_game_name ?? "",
  };
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}
      <Field
        id="display_name"
        label="Display name"
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

export function RoleControl({
  name,
  isAdmin,
  isSelf,
  setRole,
}: {
  name: string;
  isAdmin: boolean;
  isSelf: boolean;
  setRole: (role: "member" | "admin") => Promise<{ error?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (isSelf) {
    return (
      <p className="text-sm text-dust italic">
        You can&apos;t change your own role. Ask another board member.
      </p>
    );
  }

  const next = isAdmin ? "member" : "admin";
  return (
    <div>
      <ConfirmDialog
        trigger={
          pending
            ? "Saving…"
            : isAdmin
              ? "Remove from the board"
              : "Add to the board"
        }
        triggerVariant={isAdmin ? "danger" : "secondary"}
        tone={isAdmin ? "danger" : "primary"}
        title={
          isAdmin
            ? `Remove ${name} from the board?`
            : `Add ${name} to the board?`
        }
        confirmLabel={isAdmin ? "Remove" : "Add"}
        onConfirm={() =>
          startTransition(async () => {
            setError(null);
            const result = await setRole(next);
            if (result.error) setError(result.error);
          })
        }
      >
        {isAdmin
          ? "They will no longer be able to review or edit horses."
          : "They will be able to review, edit and delete any horse, and manage members."}
      </ConfirmDialog>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rejected">
          {error}
        </p>
      )}
    </div>
  );
}
