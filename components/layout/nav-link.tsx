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
        "border-b py-1 label-caps transition-colors",
        active
          ? "border-rust text-paper"
          : "border-transparent text-taupe hover:text-paper",
        className,
      )}
    >
      {children}
    </Link>
  );
}
