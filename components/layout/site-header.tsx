import Image from "next/image";
import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { mainNav, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="relative">
      <div className="bg-ink text-taupe">
        <div className="page-container flex h-8 items-center justify-between">
          <p className="pt-[3px] label-caps">{site.association}</p>
          <a
            href={site.mainSiteUrl}
            className="hidden pt-[3px] label-caps transition-colors hover:text-paper sm:block"
          >
            Main website ↗
          </a>
        </div>
      </div>

      <div className="bg-paper rule-double">
        <div className="page-container flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/whma-logo.png"
              alt=""
              width={54}
              height={56}
              priority
              className="h-12 w-auto sm:h-14"
            />
            <span className="flex flex-col leading-none whitespace-nowrap">
              <span className="text-xl leading-none text-ink sm:text-2xl">
                Horse Registry
              </span>
              <span className="mt-1.5 hidden label-caps text-dust min-[400px]:block">
                Official Registration Book
              </span>
            </span>
          </Link>

          {/* TODO(T05): show Account / Admin links for signed-in users. */}
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {mainNav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            <span className="h-5 w-px bg-rule" aria-hidden />
            <NavLink href="/sign-in">Sign in</NavLink>
          </nav>

          <MobileNav />
        </div>
      </div>
    </header>
  );
}
