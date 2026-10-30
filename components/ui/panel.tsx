import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
  actions?: ReactNode;
};

/** Raised card-stock surface with an optional captioned header. */
export function Panel({
  title,
  actions,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-xs border border-rule bg-card shadow-card",
        className,
      )}
      {...props}
    >
      {title && (
        <header className="flex items-center justify-between gap-4 border-b border-rule px-5 pt-4 pb-3">
          <h2 className="label-caps text-saddle">{title}</h2>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Small caps heading followed by a hairline that runs to the edge. */
export function SectionHeading({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <h2 className="shrink-0 label-caps text-saddle">{children}</h2>
      <span className="h-px flex-1 bg-rule" aria-hidden />
      {action}
    </div>
  );
}
