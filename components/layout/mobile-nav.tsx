"use client";

import Link from "next/link";
import { useState } from "react";

import { mainNav, site } from "@/lib/site";

type NavItem = { href: string; label: string };

/** `accountLinks` are the signed-in (or Sign in) links shown after the main nav. */
export function MobileNav({ accountLinks }: { accountLinks: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2.5 label-caps text-paper"
      >
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden>
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
          className="absolute inset-x-0 top-full border-t border-saddle bg-ink"
        >
          <ul className="page-container flex flex-col pb-4">
            {[...mainNav, ...accountLinks].map((item) => (
              <li key={item.href} className="border-b border-bark">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 label-caps text-taupe hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={site.mainSiteUrl}
                className="block pt-4 text-sm text-taupe italic"
              >
                ttr-whma.weebly.com
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
