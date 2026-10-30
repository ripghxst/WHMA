import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";

import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xs border border-rule bg-card px-3 font-serif text-base text-text placeholder:text-dust/70 transition-colors hover:border-taupe focus:border-saddle aria-invalid:border-rejected disabled:bg-paper-deep disabled:text-dust";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(control, "py-2.5", className)}
      {...props}
    />
  );
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath stroke='%234a3833' stroke-width='1.5' d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E\")";

export function Select({
  className,
  style,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        control,
        "h-11 appearance-none bg-[position:right_0.85rem_center] bg-no-repeat pr-9",
        className,
      )}
      style={{ backgroundImage: chevron, ...style }}
      {...props}
    />
  );
}

type FieldProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<ComponentProps<"input">>;
};

/**
 * Label + control + hint + error. Wires up id, aria-describedby and
 * aria-invalid on the single child control.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="label-caps text-saddle">
        {label}
        {required && (
          <span className="text-rust" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {isValidElement(children)
        ? cloneElement(children, {
            id,
            required,
            "aria-describedby": describedBy,
            "aria-invalid": error ? true : undefined,
          })
        : children}
      {hint && (
        <p id={hintId} className="text-sm text-dust italic">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-rejected">
          {error}
        </p>
      )}
    </div>
  );
}
