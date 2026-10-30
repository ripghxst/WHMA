import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

/** Ledger-style table. Scrolls sideways on narrow screens. */
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto border-y border-bark">
      <table
        className={cn("w-full border-collapse text-left text-base", className)}
        {...props}
      />
    </div>
  );
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead className={cn("bg-paper-deep rule-double", className)} {...props} />
  );
}

export function TBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-rule last:border-b-0 hover:bg-card",
        className,
      )}
      {...props}
    />
  );
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 pt-3 pb-2 label-caps font-normal whitespace-nowrap text-saddle",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("px-3 py-2.5 align-middle", className)} {...props} />
  );
}
