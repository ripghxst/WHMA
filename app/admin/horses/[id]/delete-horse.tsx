"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { boardDeleteHorse } from "../actions";

export function DeleteHorse({
  horseId,
  name,
  offspring,
}: {
  horseId: string;
  name: string;
  /** Registered horses that list this one as a parent. */
  offspring: number;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <ConfirmDialog
        trigger={pending ? "Deleting…" : "Delete horse"}
        triggerVariant="danger"
        tone="danger"
        title={`Delete ${name}?`}
        confirmLabel="Delete"
        onConfirm={() =>
          startTransition(async () => {
            setError(null);
            const result = await boardDeleteHorse(horseId);
            if (result.error) {
              setError(result.error);
              return;
            }
            router.push("/admin/horses?deleted=1");
            router.refresh();
          })
        }
      >
        The horse, its photos and its history are removed for good.
        {offspring > 0 &&
          ` ${offspring} ${offspring === 1 ? "horse lists" : "horses list"} it as a parent; they will keep its name as an unregistered parent.`}
      </ConfirmDialog>
      {error && (
        <p role="alert" className="mt-2 text-sm text-rejected">
          {error}
        </p>
      )}
    </div>
  );
}
