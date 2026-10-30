import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "error";

const tones: Record<Tone, string> = {
  info: "border-saddle bg-paper-deep",
  success: "border-approved bg-approved-tint",
  warning: "border-pending bg-pending-tint",
  error: "border-rejected bg-rejected-tint",
};

const titleTones: Record<Tone, string> = {
  info: "text-saddle",
  success: "text-approved",
  warning: "text-pending",
  error: "text-rejected",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xs border-l-[3px] px-4 py-3",
        tones[tone],
        className,
      )}
    >
      {title && (
        <p className={cn("mb-1 pt-0.5 label-caps", titleTones[tone])}>
          {title}
        </p>
      )}
      {children && <div className="text-base text-text">{children}</div>}
    </div>
  );
}
