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
      <div className="page-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex gap-5">
          <Image
            src="/brand/whma-logo.png"
            alt=""
            width={72}
            height={75}
            className="h-[75px] w-auto shrink-0 invert"
          />
          <p className="max-w-sm text-sm">
            The registry is kept by the WHMA registration board. Every horse
            listed here has been reviewed against the Association&apos;s
            registration criteria.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="mb-3 label-caps text-paper">{col.title}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith("http") ? (
                    <a
                      href={link.href}
                      className="transition-colors hover:text-paper"
                    >
                      {link.label} ↗
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

      <div className="border-t border-saddle">
        <p className="page-container py-4 text-xs text-taupe/80">
          {site.association} · A RedM community association, not affiliated with
          Rockstar Games.
        </p>
      </div>
    </footer>
  );
}
