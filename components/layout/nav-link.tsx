"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export function NavLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b-2 pt-[3px] pb-1 label-caps transition-colors",
        active
          ? "border-rust text-ink"
          : "border-transparent text-saddle hover:border-taupe hover:text-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}
