"use client";

import { useState, useTransition } from "react";

import { ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { HorseStatus } from "@/lib/horses";

import type { ActionResult } from "./actions";

type Props = {
  horseId: string;
  name: string;
  status: HorseStatus;
  publicHref: string | null;
  submitAction: () => Promise<ActionResult>;
  deleteAction: () => Promise<ActionResult>;
};

/** Per-horse actions on the dashboard; what's offered depends on the status. */
export function HorseActions({
  horseId,
  name,
  status,
  publicHref,
  submitAction,
  deleteAction,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
    });

  if (status === "approved") {
    return publicHref ? (
      <ButtonLink
        href={publicHref}
        variant="secondary"
        size="sm"
        className="col-span-2 justify-self-start sm:col-span-1"
      >
        View in registry
      </ButtonLink>
    ) : null;
  }

  if (status !== "draft" && status !== "changes_requested") return null;

  return (
    <div className="col-span-2 flex flex-col items-start gap-2 sm:col-span-1 sm:items-end">
      <div className="flex flex-wrap gap-2" aria-busy={pending}>
        <ButtonLink
          href={`/horses/${horseId}/edit`}
          variant="secondary"
          size="sm"
        >
          Edit
        </ButtonLink>
        <ConfirmDialog
          trigger={pending ? "Working…" : "Submit"}
          triggerVariant="primary"
          triggerSize="sm"
          title={`Submit ${name} for review?`}
          confirmLabel="Submit"
          onConfirm={() => run(submitAction)}
        >
          The registration board will review your horse. You won&apos;t be able
          to edit it while it&apos;s in review.
        </ConfirmDialog>
        <ConfirmDialog
          trigger="Delete"
          triggerVariant="ghost"
          triggerSize="sm"
          tone="danger"
          title={`Delete ${name}?`}
          confirmLabel="Delete"
          onConfirm={() => run(deleteAction)}
        >
          The horse and its photos will be removed. This can&apos;t be undone.
        </ConfirmDialog>
      </div>
      {error && (
        <p
          role="alert"
          className="max-w-xs text-sm text-rejected sm:text-right"
        >
          {error}
        </p>
      )}
    </div>
  );
}
