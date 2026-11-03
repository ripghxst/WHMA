"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function navLinkClass(active: boolean, className?: string) {
  return cn(
    "border-b py-1 label-caps transition-colors",
    active
      ? "border-rust text-paper"
      : "border-transparent text-taupe hover:text-paper",
    className,
  );
}

/** Header link that marks the current section. Must render inside <Suspense>. */
export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={navLinkClass(active, className)}
    >
      {children}
    </Link>
  );
}

/** Same look without the current-section marker, for the prerendered shell. */
export function StaticNavLink({ href, children, className }: NavLinkProps) {
  return (
    <Link href={href} className={navLinkClass(false, className)}>
      {children}
    </Link>
  );
}
