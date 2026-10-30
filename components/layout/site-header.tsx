import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { mainNav } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="relative z-30 bg-ink text-taupe">
      <div className="page-container flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-paper">
          <Image
            src="/brand/whma-logo.png"
            alt=""
            width={40}
            height={42}
            priority
            className="h-10 w-auto invert"
          />
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="heading-caps text-xl leading-none">WHMA</span>
            <span className="heading-caps text-xl leading-none font-normal text-taupe">
              Registry
            </span>
          </span>
        </Link>

        {/* TODO(T05): show Account / Admin links for signed-in users. */}
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {mainNav.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
          <Link
            href="/sign-in"
            className="rounded-xs border border-dust px-4 py-2 label-caps text-paper transition-colors hover:border-paper"
          >
            Sign in
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
