import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listPending, statusCounts } from "@/lib/admin";

import { PendingList } from "./pending-list";

export const metadata: Metadata = { title: "Registration board" };

const summary = [
  { key: "pending", label: "Waiting for review", href: "/admin/review" },
  { key: "changes_requested", label: "With members for changes" },
  { key: "approved", label: "Registered" },
  { key: "rejected", label: "Denied" },
  { key: "draft", label: "Drafts" },
] as const;

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function AdminPage() {
  const [counts, oldest] = await Promise.all([statusCounts(), listPending(5)]);

  return (
    <div className="page-container py-10">
      <h1 className="heading-caps text-3xl text-ink">Overview</h1>

      <dl className="mt-8 grid grid-cols-2 border-y border-bark sm:grid-cols-5">
        {summary.map((s) => (
          <div
            key={s.key}
            className="border-b border-rule px-4 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
          >
            <dt className="label-caps text-saddle">{s.label}</dt>
            <dd className="mt-1 font-mono text-3xl text-ink">
              {"href" in s ? (
                <Link href={s.href} className="hover:text-rust">
                  {counts[s.key]}
                </Link>
              ) : (
                counts[s.key]
              )}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="oldest-heading" className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2
            id="oldest-heading"
            className="heading-caps text-xl text-dust sm:text-2xl"
          >
            Waiting longest
          </h2>
          {counts.pending > oldest.length && (
            <Link href="/admin/review" className="label-caps text-rust">
              All {counts.pending}
            </Link>
          )}
        </div>
        {oldest.length === 0 ? (
          <EmptyState title="Nothing to review">
            New submissions will appear here.
          </EmptyState>
        ) : (
          <>
            <PendingList horses={oldest} />
            <div className="mt-6">
              <ButtonLink href={`/admin/review/${oldest[0].id}`}>
                Review the oldest
              </ButtonLink>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
