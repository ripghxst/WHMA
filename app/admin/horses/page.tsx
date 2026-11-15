import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { HorseThumb } from "@/components/registry/horse-thumb";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { ADMIN_PAGE_SIZE, listAllHorses } from "@/lib/admin-lists";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "All horses" };

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

async function Flash({
  searchParams,
}: {
  searchParams: PageProps<"/admin/horses">["searchParams"];
}) {
  const params = await searchParams;
  if (params.saved)
    return (
      <Alert tone="success" className="mb-6">
        Changes saved.
      </Alert>
    );
  if (params.deleted)
    return (
      <Alert tone="success" className="mb-6">
        Horse deleted.
      </Alert>
    );
  return null;
}

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardHorsesPage(
  props: PageProps<"/admin/horses">,
) {
  const params = await props.searchParams;
  const filters = {
    q: first(params.q).trim(),
    status: first(params.status),
    owner: first(params.owner),
    page: Math.max(1, Number(first(params.page)) || 1),
  };
  const { horses, total } = await listAllHorses(filters);
  const hrefForPage = (page: number) => {
    const sp = new URLSearchParams();
    if (filters.q) sp.set("q", filters.q);
    if (filters.status) sp.set("status", filters.status);
    if (filters.owner) sp.set("owner", filters.owner);
    if (page > 1) sp.set("page", String(page));
    return `/admin/horses${sp.size ? `?${sp}` : ""}`;
  };

  return (
    <div className="page-container py-10">
      <Suspense>
        <Flash searchParams={props.searchParams} />
      </Suspense>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="heading-caps text-3xl text-ink">All horses</h1>
        <ButtonLink href="/admin/horses/new" variant="secondary">
          Add a Foundation horse
        </ButtonLink>
      </div>

      <Form
        action="/admin/horses"
        key={JSON.stringify(filters)}
        className="mt-6 grid gap-3 sm:grid-cols-[1fr_14rem_auto]"
      >
        {filters.owner && (
          <input type="hidden" name="owner" value={filters.owner} />
        )}
        <Input
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Name, barn name, WHMA number or imported owner"
          aria-label="Search horses"
        />
        <Select name="status" defaultValue={filters.status} aria-label="Status">
          <option value="">Any status</option>
          <option value="pending">In review</option>
          <option value="changes_requested">Changes requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Denied</option>
          <option value="draft">Draft</option>
        </Select>
        <Button type="submit">Filter</Button>
      </Form>

      <p className="mt-6 mb-3 text-sm text-dust">
        {total} {total === 1 ? "horse" : "horses"}
        {filters.owner && (
          <>
            {" "}
            for one member ·{" "}
            <Link href="/admin/horses" className="text-rust hover:underline">
              Show all
            </Link>
          </>
        )}
      </p>

      {horses.length === 0 ? (
        <EmptyState title="No horses match">
          Try another search or status.
        </EmptyState>
      ) : (
        <>
          <Table>
            <THead>
              <tr>
                <TH className="w-20">
                  <span className="sr-only">Photo</span>
                </TH>
                <TH>Registered name</TH>
                <TH>WHMA No.</TH>
                <TH>Status</TH>
                <TH className="hidden md:table-cell">Owner</TH>
                <TH className="hidden text-right lg:table-cell">Updated</TH>
              </tr>
            </THead>
            <TBody>
              {horses.map((h) => (
                <TR key={h.id}>
                  <TD className="py-2">
                    <HorseThumb
                      photos={h.horse_photos}
                      sizes="64px"
                      className="w-16"
                    />
                  </TD>
                  <TD>
                    <Link
                      href={`/admin/horses/${h.id}`}
                      className="text-ink underline-offset-4 hover:text-rust hover:underline"
                    >
                      {h.registered_name}
                    </Link>
                    {h.barn_name && (
                      <span className="block text-sm text-dust italic">
                        {h.barn_name}
                      </span>
                    )}
                  </TD>
                  <TD className="font-mono text-sm whitespace-nowrap">
                    {h.registration_number ??
                      (h.is_foundation ? "Foundation" : "—")}
                  </TD>
                  <TD>
                    <StatusBadge status={h.status} />
                  </TD>
                  <TD className="hidden md:table-cell">
                    {h.owner?.display_name ?? (
                      <span className="text-dust italic">
                        {h.legacy_owner_name ?? "No owner"}
                      </span>
                    )}
                  </TD>
                  <TD className="hidden text-right text-sm whitespace-nowrap text-dust lg:table-cell">
                    {formatDate(h.updated_at)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <div className="mt-8">
            <Pagination
              page={filters.page}
              totalPages={Math.ceil(total / ADMIN_PAGE_SIZE)}
              hrefForPage={hrefForPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
