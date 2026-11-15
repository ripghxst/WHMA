import type { Metadata } from "next";
import { Suspense } from "react";

import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { listPending } from "@/lib/admin";

import { PendingList } from "../pending-list";

export const metadata: Metadata = { title: "Review queue" };

const doneMessages: Record<string, string> = {
  approved: "Horse approved and added to the registry.",
  changes_requested: "Sent back to the member with your note.",
  rejected: "Registration denied. The member can see your reason.",
};

async function DoneMessage({
  searchParams,
}: {
  searchParams: PageProps<"/admin/review">["searchParams"];
}) {
  const { done } = await searchParams;
  const message = typeof done === "string" ? doneMessages[done] : undefined;
  return message ? (
    <Alert tone="success" className="mb-6">
      {message}
    </Alert>
  ) : null;
}

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function ReviewQueuePage(
  props: PageProps<"/admin/review">,
) {
  const pending = await listPending();

  return (
    <div className="page-container py-10">
      <Suspense>
        <DoneMessage searchParams={props.searchParams} />
      </Suspense>
      <h1 className="heading-caps text-3xl text-ink">Review queue</h1>
      <p className="mt-2 mb-8 text-saddle">
        Submissions waiting for a decision, oldest first.
      </p>
      {pending.length === 0 ? (
        <EmptyState title="Nothing to review">
          The queue is clear. New submissions will appear here.
        </EmptyState>
      ) : (
        <PendingList horses={pending} />
      )}
    </div>
  );
}
