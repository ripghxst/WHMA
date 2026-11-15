"use client";

import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Field, Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/cn";

import type { ReviewState } from "../actions";

type Decision = "approved" | "changes_requested" | "rejected";

const decisions: { value: Decision; label: string; hint: string }[] = [
  {
    value: "approved",
    label: "Approve",
    hint: "The horse gets its WHMA number and is added to the public registry.",
  },
  {
    value: "changes_requested",
    label: "Ask for adjustments",
    hint: "The horse goes back to the member with your note so they can fix it and resubmit.",
  },
  {
    value: "rejected",
    label: "Deny",
    hint: "The registration is closed. The member sees your reason.",
  },
];

const submitLabels: Record<Decision, string> = {
  approved: "Approve and register",
  changes_requested: "Send back to member",
  rejected: "Deny registration",
};

export function ReviewForm({
  action,
  proposedNumber,
  ineligible,
}: {
  action: (state: ReviewState, formData: FormData) => Promise<ReviewState>;
  proposedNumber: string | null;
  ineligible: boolean;
}) {
  const [state, formAction] = useActionState(action, {});
  const [decision, setDecision] = useState<Decision>(
    (state.values?.decision as Decision) ??
      (ineligible ? "changes_requested" : "approved"),
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <fieldset>
        <legend className="mb-2 label-caps text-saddle">Decision</legend>
        <div className="flex flex-col gap-2">
          {decisions.map((d) => (
            <label
              key={d.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-xs border p-3",
                decision === d.value
                  ? "border-bark bg-card"
                  : "border-rule hover:border-taupe",
              )}
            >
              <input
                type="radio"
                name="decision"
                value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                className="mt-1 accent-rust"
              />
              <span>
                <span className="block text-ink">{d.label}</span>
                <span className="block text-sm text-dust">{d.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.decision && (
          <p className="mt-2 text-sm text-rejected">{errors.decision}</p>
        )}
      </fieldset>

      {decision === "approved" && (
        <Field
          id="number"
          label="WHMA number"
          hint={
            ineligible
              ? "Neither parent is a classified breed, so no number was generated. Enter one only if the board has agreed an exception."
              : "Generated from the breed and parents. You can change it before approving."
          }
          error={errors.number}
          required
        >
          <Input
            name="number"
            defaultValue={state.values?.number ?? proposedNumber ?? ""}
            placeholder="WHMA-AM2-123456"
            className="font-mono! uppercase"
            autoComplete="off"
          />
        </Field>
      )}

      <Field
        id="note"
        label={
          decision === "approved"
            ? "Note for the history (optional)"
            : decision === "rejected"
              ? "Reason for the member"
              : "What the member should change"
        }
        hint={
          decision === "approved"
            ? "Only the board and the owner can see this."
            : "The member sees this on their dashboard and in the form."
        }
        error={errors.note}
        required={decision !== "approved"}
      >
        <Textarea
          name="note"
          rows={4}
          maxLength={2000}
          defaultValue={state.values?.note}
        />
      </Field>

      <div>
        <SubmitButton
          pendingLabel="Saving…"
          variant={decision === "rejected" ? "danger" : "primary"}
        >
          {submitLabels[decision]}
        </SubmitButton>
      </div>
    </form>
  );
}
