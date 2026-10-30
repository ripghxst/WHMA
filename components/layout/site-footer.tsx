import Image from "next/image";
import Link from "next/link";

import { site } from "@/lib/site";

const columns = [
  {
    title: "Registry",
    links: [
      { href: "/registry", label: "Browse horses" },
      { href: "/members", label: "Members" },
      { href: "/horses/new", label: "Register a horse" },
    ],
  },
  {
    title: "Association",
    links: [
      { href: site.mainSiteUrl, label: "WHMA website" },
      { href: site.criteriaUrl, label: "Registration criteria" },
      { href: site.teamUrl, label: "Meet the team" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-taupe">
      <div className="page-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex items-start gap-5">
          <Image
            src="/brand/whma-logo.png"
            alt=""
            width={64}
            height={66}
            className="h-16 w-auto shrink-0 invert"
          />
          <div>
            <p className="heading-caps text-lg text-paper">
              Wild Horse &amp; Mustang Association
            </p>
            <p className="mt-2 max-w-sm text-sm">
              The registry is kept by the WHMA registration board. Every horse
              listed here has been reviewed against the Association&apos;s
              registration criteria.
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-4 label-caps text-paper">{col.title}</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      className="transition-colors hover:text-paper"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-bark">
        <p className="page-container py-5 text-xs text-taupe">
          A RedM community association. Not affiliated with Rockstar Games.
        </p>
      </div>
    </footer>
  );
}
