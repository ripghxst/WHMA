import type { Metadata } from "next";
import { Suspense } from "react";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Your horses" };

// TODO(T06): list the member's horses with their status.
async function Dashboard({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { profile } = await requireUser("/dashboard");
  const params = await searchParams;

  return (
    <>
      <h1 className="heading-caps text-3xl text-ink">
        {profile.display_name}&apos;s horses
      </h1>
      {params.welcome && (
        <Alert tone="success" title="Email confirmed" className="mt-6">
          Welcome to the WHMA registry. You can now register your horses.
        </Alert>
      )}
      {params.password === "updated" && (
        <Alert tone="success" className="mt-6">
          Your password has been changed.
        </Alert>
      )}
      <EmptyState
        className="mt-10"
        title="No horses yet"
        action={<ButtonLink href="/horses/new">Register a horse</ButtonLink>}
      >
        Horses you register will be listed here with their review status.
      </EmptyState>
    </>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <div className="page-container py-14">
      <Suspense fallback={<p className="text-dust italic">Loading…</p>}>
        <Dashboard searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
