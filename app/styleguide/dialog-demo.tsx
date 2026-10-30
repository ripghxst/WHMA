"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DialogDemo() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <ConfirmDialog
        trigger="Delete horse"
        triggerVariant="danger"
        tone="danger"
        title="Delete this horse?"
        confirmLabel="Delete"
        onConfirm={() => setResult("Deleted (demo)")}
      >
        (PETE) Safari and its photos will be removed from the registry. This
        cannot be undone.
      </ConfirmDialog>
      <ConfirmDialog
        trigger="Submit for review"
        title="Submit for review?"
        confirmLabel="Submit"
        onConfirm={() => setResult("Submitted (demo)")}
      >
        You can&apos;t edit the horse while the board is reviewing it.
      </ConfirmDialog>
      {result && <span className="text-sm text-dust italic">{result}</span>}
    </div>
  );
}
