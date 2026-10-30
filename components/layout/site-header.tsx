import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLink } from "@/components/layout/nav-link";
import { getSession } from "@/lib/auth";
import { mainNav } from "@/lib/site";

type Account = { name: string; isAdmin: boolean } | null;

function HeaderNav({ account }: { account: Account }) {
  const accountLinks = account
    ? [
        ...(account.isAdmin ? [{ href: "/admin", label: "Board" }] : []),
        { href: "/dashboard", label: "My horses" },
        { href: "/account", label: "Account" },
      ]
    : [{ href: "/sign-in", label: "Sign in" }];

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
        {mainNav.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
        {account ? (
          <>
            <span className="h-5 w-px bg-saddle" aria-hidden />
            {account.isAdmin && <NavLink href="/admin">Board</NavLink>}
            <NavLink href="/dashboard">My horses</NavLink>
            <Link
              href="/account"
              className="max-w-40 truncate rounded-xs border border-dust px-4 py-2 label-caps text-paper transition-colors hover:border-paper"
            >
              {account.name}
            </Link>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-xs border border-dust px-4 py-2 label-caps text-paper transition-colors hover:border-paper"
          >
            Sign in
          </Link>
        )}
      </nav>

      <MobileNav accountLinks={accountLinks} />
    </>
  );
}

async function SessionNav() {
  const session = await getSession();
  return (
    <HeaderNav
      account={
        session
          ? { name: session.profile.display_name, isAdmin: session.isAdmin }
          : null
      }
    />
  );
}

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

        {/* The static shell renders the signed-out nav; the session streams in. */}
        <Suspense fallback={<HeaderNav account={null} />}>
          <SessionNav />
        </Suspense>
      </div>
    </header>
  );
}
