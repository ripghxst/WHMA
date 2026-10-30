import type { Metadata } from "next";

import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Registration board" };

// TODO(T11): review queue and status overview.
export default function AdminPage() {
  return (
    <div className="page-container py-14">
      <h1 className="heading-caps text-3xl text-ink">Registration board</h1>
      <EmptyState className="mt-10" title="Review queue">
        Submitted horses will be listed here for review.
      </EmptyState>
    </div>
  );
}
