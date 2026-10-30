"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNav, site } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 px-1 pt-[3px] label-caps text-saddle"
      >
        <svg
          width="18"
          height="12"
          viewBox="0 0 18 12"
          aria-hidden
          className="-mt-[3px]"
        >
          {open ? (
            <path
              d="M3 0.5 15 11.5M15 0.5 3 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          ) : (
            <path
              d="M0 1h18M0 6h18M0 11h18"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )}
        </svg>
        Menu
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full z-20 border-b border-bark bg-paper shadow-card"
        >
          <ul className="page-container flex flex-col py-2">
            {[...mainNav, { href: "/sign-in", label: "Sign in" }].map(
              (item) => (
                <li
                  key={item.href}
                  className="border-b border-rule last:border-b-0"
                >
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="block py-3.5 pt-4 label-caps text-saddle aria-[current=page]:text-rust"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <a
                href={site.mainSiteUrl}
                className="block py-3.5 text-sm text-dust italic"
              >
                Back to the WHMA website ↗
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
