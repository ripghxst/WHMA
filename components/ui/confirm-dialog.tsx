"use client";

import { useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  trigger: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  triggerVariant?: "primary" | "secondary" | "ghost" | "danger";
  triggerSize?: "sm" | "md";
  /** Runs when confirmed. For server mutations pass a Server Function. */
  onConfirm: () => void | Promise<void>;
};

/** Modal confirmation built on the native <dialog> element. */
export function ConfirmDialog({
  trigger,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  triggerVariant = "secondary",
  triggerSize = "md",
  onConfirm,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => ref.current?.showModal()}
      >
        {trigger}
      </Button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xs border border-bark bg-card p-0 text-text shadow-dialog backdrop:bg-ink/50"
        onClick={(e) => {
          // Close when the backdrop (the dialog element itself) is clicked.
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <form
          method="dialog"
          className="flex flex-col gap-4 p-6"
          onSubmit={async (e) => {
            const submitter = (e.nativeEvent as SubmitEvent).submitter;
            if (submitter?.getAttribute("value") === "confirm")
              await onConfirm();
          }}
        >
          <h2 id={titleId} className="text-xl">
            {title}
          </h2>
          {children && <div className="text-dust">{children}</div>}
          <div className="mt-2 flex justify-end gap-3">
            <Button type="submit" value="cancel" variant="secondary">
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              value="confirm"
              variant={tone}
              autoFocus={tone !== "danger"}
            >
              {confirmLabel}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
