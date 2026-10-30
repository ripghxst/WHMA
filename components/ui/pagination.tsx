import Link from "next/link";

import { cn } from "@/lib/cn";

/** Page numbers to show: always first, last and the neighbours of the current page. */
function pageItems(page: number, total: number): Array<number | "gap"> {
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

const item =
  "label-caps inline-flex h-9 min-w-9 items-center justify-center px-2";

export function Pagination({
  page,
  totalPages,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {page > 1 ? (
        <Link
          href={hrefForPage(page - 1)}
          className={cn(item, "text-rust hover:text-rust-deep")}
        >
          ← Prev
        </Link>
      ) : (
        <span className={cn(item, "text-taupe")}>← Prev</span>
      )}

      {pageItems(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className={cn(item, "text-dust")} aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={cn(item, "text-ink rule-double")}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(p)}
            className={cn(item, "text-saddle hover:text-rust")}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefForPage(page + 1)}
          className={cn(item, "text-rust hover:text-rust-deep")}
        >
          Next →
        </Link>
      ) : (
        <span className={cn(item, "text-taupe")}>Next →</span>
      )}
    </nav>
  );
}
