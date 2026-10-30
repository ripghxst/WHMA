import Image from "next/image";

import riderArena from "@/public/images/rider-arena.jpg";

/**
 * Split layout for sign-in, sign-up and password pages: photo left, form right.
 * -mb-24 cancels the footer's top margin so the photo meets the footer.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="-mb-24 grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <Image
          src={riderArena}
          alt=""
          placeholder="blur"
          sizes="45vw"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-transparent"
          aria-hidden
        />
        <p className="absolute right-10 bottom-10 left-10 max-w-sm text-lg text-paper/90">
          Members register their horses with the Association. The registration
          board reviews every submission before it enters the registry.
        </p>
      </div>
      <div className="flex items-start justify-center px-4 py-12 sm:px-6 lg:items-center lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
