"use client";

import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FormState } from "@/lib/validation/auth";

import { addBreed } from "./actions";

export function AddBreedForm() {
  const [state, action] = useActionState(addBreed, {} as FormState);
  const [classified, setClassified] = useState(false);
  const err = (k: string) => state.fieldErrors?.[k]?.[0];

  return (
    <form
      // Start fresh after a breed is added.
      key={state.success}
      action={action}
      noValidate
      className="flex flex-col gap-5"
    >
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.success && <Alert tone="success">{state.success}</Alert>}
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <Field id="breed-name" label="Breed name" error={err("name")} required>
          <Input name="name" defaultValue={state.values?.name} maxLength={60} />
        </Field>
        {classified && (
          <Field
            id="breed-code"
            label="Code"
            hint="Two letters"
            error={err("code")}
            required
          >
            <Input
              name="code"
              defaultValue={state.values?.code}
              maxLength={2}
              className="font-mono! uppercase"
            />
          </Field>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="classified"
          checked={classified}
          onChange={(e) => setClassified(e.target.checked)}
          className="accent-rust"
        />
        Classified breed (qualifies a horse for registration and gets a code in
        WHMA numbers)
      </label>
      <div>
        <SubmitButton pendingLabel="Adding…">Add breed</SubmitButton>
      </div>
    </form>
  );
}
