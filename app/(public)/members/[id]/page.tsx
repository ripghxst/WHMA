import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { RegistryList } from "@/components/registry/registry-list";
import { EmptyState } from "@/components/ui/empty-state";
import { loadMember } from "@/lib/members";
import { listOwnerHorses } from "@/lib/registry";

export async function generateMetadata({
  params,
}: PageProps<"/members/[id]">): Promise<Metadata> {
  const member = await loadMember((await params).id);
  return member
    ? {
        title: member.display_name,
        description: `Horses registered with the WHMA by ${member.display_name}.`,
      }
    : { title: "No record found" };
}

async function MemberProfile({
  params,
}: {
  params: PageProps<"/members/[id]">["params"];
}) {
  const { id } = await params;
  const member = await loadMember(id);
  if (!member) notFound();
  const horses = await listOwnerHorses(member.id);

  const details = [
    ["In-game name", member.in_game_name],
    ["Discord", member.discord_username],
  ] as const;

  return (
    <>
      <header className="border-b border-rule pb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-3xl text-ink sm:text-4xl">
            {member.display_name}
          </h1>
          {member.role === "admin" && (
            <span className="inline-flex rounded-xs border-[3px] border-double border-rust px-2 py-0.5 label-caps text-rust">
              Registration board
            </span>
          )}
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1">
          {details.map(
            ([label, value]) =>
              value && (
                <div key={label} className="flex items-baseline gap-2">
                  <dt className="label-caps text-saddle">{label}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ),
          )}
        </dl>
      </header>

      <section aria-labelledby="horses-heading" className="mt-10">
        <h2
          id="horses-heading"
          className="mb-4 heading-caps text-xl text-dust sm:text-2xl"
        >
          Registered horses
          <span className="ml-3 font-mono text-base font-normal tracking-normal text-saddle">
            {horses.length}
          </span>
        </h2>
        {horses.length === 0 ? (
          <EmptyState title="No registered horses yet">
            Horses appear here once the registration board approves them.
          </EmptyState>
        ) : (
          <RegistryList horses={horses} showOwner={false} />
        )}
      </section>
    </>
  );
}

export default function MemberPage(props: PageProps<"/members/[id]">) {
  return (
    <div className="page-container min-h-svh pt-10">
      <Link
        href="/members"
        className="mb-6 inline-block label-caps text-rust hover:text-rust-deep"
      >
        Members
      </Link>
      <Suspense fallback={<PageLoading />}>
        <MemberProfile params={props.params} />
      </Suspense>
    </div>
  );
}
