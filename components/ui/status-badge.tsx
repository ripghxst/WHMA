import { cn } from "@/lib/cn";

export type HorseStatus =
  "draft" | "pending" | "changes_requested" | "approved" | "rejected";

// Wording follows the WHMA registration page: approve, ask for adjustments, or deny.
const statuses: Record<HorseStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-dust bg-paper-deep text-saddle" },
  pending: {
    label: "In review",
    className: "border-pending bg-pending-tint text-pending",
  },
  changes_requested: {
    label: "Changes requested",
    className: "border-changes bg-changes-tint text-changes",
  },
  approved: {
    label: "Approved",
    className: "border-approved bg-approved-tint text-approved",
  },
  rejected: {
    label: "Denied",
    className: "border-rejected bg-rejected-tint text-rejected",
  },
};

/** Stamp-style status mark with a double border. */
export function StatusBadge({
  status,
  className,
}: {
  status: HorseStatus;
  className?: string;
}) {
  const { label, className: tone } = statuses[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs border-[3px] border-double px-2 pt-[3px] pb-px label-caps whitespace-nowrap",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
