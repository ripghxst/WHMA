import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { loadMember } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

import { boardUpdateProfile, setMemberRole } from "../actions";
import { BoardProfileForm, RoleControl } from "./member-forms";

export const metadata: Metadata = { title: "Member" };

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardMemberPage({
  params,
}: PageProps<"/admin/members/[id]">) {
  const { userId } = await requireAdmin();
  const { id } = await params;
  const member = await loadMember(id);
  if (!member) notFound();

  const supabase = await createClient();
  const { data: horses } = await supabase
    .from("horses")
    .select("status")
    .eq("owner_id", member.id);
  const total = horses?.length ?? 0;
  const approved = horses?.filter((h) => h.status === "approved").length ?? 0;

  return (
    <div className="page-container max-w-3xl py-10">
      <Link
        href="/admin/members"
        className="mb-6 inline-block label-caps text-rust"
      >
        All members
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-3xl text-ink sm:text-4xl">{member.display_name}</h1>
        {member.role === "admin" && (
          <span className="inline-flex rounded-xs border-[3px] border-double border-rust px-2 py-0.5 label-caps text-rust">
            Registration board
          </span>
        )}
      </div>

      <section className="mt-10">
        <h2 className="mb-4 border-b border-rule pb-3 heading-caps text-xl text-dust">
          Horses
        </h2>
        <p className="text-saddle">
          {total} {total === 1 ? "horse" : "horses"}, {approved} registered.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink
            href={`/admin/horses?owner=${member.id}`}
            variant="secondary"
            size="sm"
          >
            Manage their horses
          </ButtonLink>
          {approved > 0 && (
            <ButtonLink
              href={`/members/${member.id}`}
              variant="ghost"
              size="sm"
            >
              Public page
            </ButtonLink>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-6 border-b border-rule pb-3 heading-caps text-xl text-dust">
          Profile
        </h2>
        <BoardProfileForm
          profile={member}
          action={boardUpdateProfile.bind(null, member.id)}
        />
      </section>

      <section className="mt-12">
        <h2 className="mb-4 border-b border-rule pb-3 heading-caps text-xl text-dust">
          Board access
        </h2>
        <RoleControl
          name={member.display_name}
          isAdmin={member.role === "admin"}
          isSelf={member.id === userId}
          setRole={setMemberRole.bind(null, member.id)}
        />
      </section>
    </div>
  );
}
