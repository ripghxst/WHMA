import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { listAllMembers } from "@/lib/admin-lists";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Members" };

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardMembersPage(
  props: PageProps<"/admin/members">,
) {
  const params = await props.searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim() ?? "";
  const members = await listAllMembers(q);

  return (
    <div className="page-container py-10">
      <h1 className="heading-caps text-3xl text-ink">Members</h1>
      <p className="mt-2 text-saddle">
        Every account, including members without registered horses.
      </p>

      <Form action="/admin/members" className="mt-6 flex max-w-xl gap-2">
        <Input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Name, in-game name or Discord"
          aria-label="Search members"
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </Form>

      <p className="mt-6 mb-3 text-sm text-dust">
        {members.length} {members.length === 1 ? "account" : "accounts"}
      </p>

      {members.length === 0 ? (
        <EmptyState title="No members match">Try another search.</EmptyState>
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Member</TH>
              <TH className="hidden sm:table-cell">In-game name</TH>
              <TH className="hidden md:table-cell">Discord</TH>
              <TH>Horses</TH>
              <TH className="hidden text-right lg:table-cell">Joined</TH>
            </tr>
          </THead>
          <TBody>
            {members.map((m) => (
              <TR key={m.id}>
                <TD>
                  <Link
                    href={`/admin/members/${m.id}`}
                    className="text-ink underline-offset-4 hover:text-rust hover:underline"
                  >
                    {m.display_name}
                  </Link>
                  {m.role === "admin" && (
                    <span className="ml-2 label-caps text-rust">Board</span>
                  )}
                </TD>
                <TD className="hidden sm:table-cell">{m.in_game_name}</TD>
                <TD className="hidden font-mono text-sm md:table-cell">
                  {m.discord_username}
                </TD>
                <TD className="font-mono text-sm">{m.horseCount}</TD>
                <TD className="hidden text-right text-sm text-dust lg:table-cell">
                  {formatDate(m.created_at)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
