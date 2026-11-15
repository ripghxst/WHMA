import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { PageBanner } from "@/components/layout/page-banner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { listMembers } from "@/lib/members";
import herdRunning from "@/public/images/herd-running.jpg";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Members of the Wild Horse & Mustang Association and their registered horses.",
};

const horses = (n: number) => `${n} ${n === 1 ? "horse" : "horses"}`;

async function Members({
  searchParams,
}: {
  searchParams: PageProps<"/members">["searchParams"];
}) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const members = await listMembers(q);

  return (
    <>
      <Form
        action="/members"
        role="search"
        className="flex max-w-xl flex-col gap-1.5"
      >
        <label htmlFor="members-q" className="label-caps text-saddle">
          Search members
        </label>
        <div className="flex gap-2">
          <Input
            id="members-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Name, in-game name or Discord"
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </Form>

      <p className="mt-8 mb-3 text-sm text-dust" aria-live="polite">
        {members.length} {members.length === 1 ? "member" : "members"}
        {q ? " found" : " with registered horses"}
        {q && (
          <>
            {" · "}
            <Link
              href="/members"
              className="text-rust underline-offset-4 hover:underline"
            >
              Clear search
            </Link>
          </>
        )}
      </p>

      {members.length === 0 ? (
        <EmptyState title={q ? "No members match" : "No members listed yet"}>
          {q
            ? "Try part of a name, in-game name or Discord username."
            : "Members appear here once one of their horses is approved."}
        </EmptyState>
      ) : (
        <>
          <div className="hidden sm:block">
            <Table>
              <THead>
                <tr>
                  <TH>Member</TH>
                  <TH>In-game name</TH>
                  <TH>Discord</TH>
                  <TH className="text-right">Registered</TH>
                </tr>
              </THead>
              <TBody>
                {members.map((m) => (
                  <TR key={m.id}>
                    <TD>
                      <Link
                        href={`/members/${m.id}`}
                        className="text-ink underline-offset-4 hover:text-rust hover:underline"
                      >
                        {m.display_name}
                      </Link>
                      {m.role === "admin" && (
                        <span className="ml-2 label-caps text-rust">Board</span>
                      )}
                    </TD>
                    <TD>{m.in_game_name}</TD>
                    <TD className="font-mono text-sm">{m.discord_username}</TD>
                    <TD className="text-right text-sm whitespace-nowrap text-dust">
                      {horses(m.horseCount)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <ul className="border-t border-bark sm:hidden">
            {members.map((m) => (
              <li key={m.id} className="border-b border-rule py-3">
                <Link href={`/members/${m.id}`} className="text-ink">
                  {m.display_name}
                </Link>
                <p className="mt-0.5 text-sm text-dust">
                  {[m.in_game_name, m.discord_username, horses(m.horseCount)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export default function MembersPage(props: PageProps<"/members">) {
  return (
    <>
      <PageBanner title="Members" image={herdRunning}>
        Association members and the horses they have registered.
      </PageBanner>
      <div className="page-container pt-8">
        <Suspense
          fallback={<p className="py-12 text-dust italic">Loading members…</p>}
        >
          <Members searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}
