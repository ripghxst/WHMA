import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xs border border-dashed border-taupe px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-xl text-ink">{title}</p>
      {children && <div className="max-w-md text-dust italic">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
