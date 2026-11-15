"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const items = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/review", label: "Review queue" },
];

/** Section tabs for the board's pages. Rendered inside the admin Suspense boundary. */
export function AdminNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Registration board" className="border-b border-rule">
      <ul className="page-container flex gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-2 border-b-2 px-3 py-3.5 label-caps whitespace-nowrap transition-colors",
                  active
                    ? "border-rust text-ink"
                    : "border-transparent text-dust hover:text-ink",
                )}
              >
                {item.label}
                {item.href === "/admin/review" && pending > 0 && (
                  <span className="rounded-xs bg-pending-tint px-1.5 font-mono text-xs font-normal tracking-normal text-pending">
                    {pending}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
