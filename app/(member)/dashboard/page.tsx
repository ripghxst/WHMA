import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import {
  photoUrl,
  primaryPhoto,
  sexLabel,
  type HorseStatus,
} from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

import { deleteHorse, submitHorse } from "./actions";
import { HorseActions } from "./horse-actions";

export const metadata: Metadata = { title: "My horses" };

const filters: { value: HorseStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "pending", label: "In review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Denied" },
];

const emptyMessages: Record<HorseStatus, string> = {
  draft: "You have no drafts.",
  pending: "No horses are waiting for review.",
  changes_requested: "No horses need changes.",
  approved: "None of your horses have been approved yet.",
  rejected: "None of your horses have been denied.",
};

function isFilter(value: unknown): value is HorseStatus {
  return filters.some((f) => f.value !== "all" && f.value === value);
}

async function Dashboard({
  searchParams,
}: {
  searchParams: PageProps<"/dashboard">["searchParams"];
}) {
  const { userId } = await requireUser("/dashboard");
  const params = await searchParams;
  const active = isFilter(params.status) ? params.status : "all";

  const supabase = await createClient();
  const { data: horses, error } = await supabase
    .from("horses")
    .select(
      "id, registered_name, barn_name, sex, registration_number, status, review_note, updated_at, submitted_at, breed:breeds!horses_breed_id_fkey(name), horse_photos(storage_path, is_primary, sort_order)",
    )
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const counts = new Map<string, number>([["all", horses.length]]);
  horses.forEach((h) => counts.set(h.status, (counts.get(h.status) ?? 0) + 1));
  const shown =
    active === "all" ? horses : horses.filter((h) => h.status === active);

  return (
    <>
      {params.welcome && (
        <Alert tone="success" title="Email confirmed" className="mb-8">
          Welcome to the WHMA registry. You can now register your horses.
        </Alert>
      )}
      {params.password === "updated" && (
        <Alert tone="success" className="mb-8">
          Your password has been changed.
        </Alert>
      )}

      {horses.length === 0 ? (
        <EmptyState
          title="No horses yet"
          action={<ButtonLink href="/horses/new">Register a horse</ButtonLink>}
        >
          Register your first horse with its photos, genetics and parents. The
          registration board will review it before it&apos;s added to the
          registry.
        </EmptyState>
      ) : (
        <>
          <nav aria-label="Filter by status" className="-mx-1 overflow-x-auto">
            <ul className="flex min-w-max gap-1 border-b border-rule px-1">
              {filters.map((f) => {
                const count = counts.get(f.value) ?? 0;
                const isActive = f.value === active;
                return (
                  <li key={f.value}>
                    <Link
                      href={
                        f.value === "all"
                          ? "/dashboard"
                          : `/dashboard?status=${f.value}`
                      }
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "-mb-px flex items-center gap-2 border-b-2 px-3 py-3 label-caps transition-colors",
                        isActive
                          ? "border-rust text-ink"
                          : "border-transparent text-dust hover:text-ink",
                      )}
                    >
                      {f.label}
                      <span className="font-mono text-xs font-normal tracking-normal">
                        {count}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {shown.length === 0 ? (
            <p className="py-12 text-center text-dust italic">
              {active !== "all" && emptyMessages[active]}
            </p>
          ) : (
            <ul>
              {shown.map((h) => {
                const photo = primaryPhoto(h.horse_photos);
                const meta = [h.breed?.name, sexLabel(h.sex)].filter(Boolean);
                return (
                  <li
                    key={h.id}
                    className="grid grid-cols-[5rem_1fr] items-start gap-x-4 gap-y-3 border-b border-rule py-5 sm:grid-cols-[7rem_1fr_auto]"
                  >
                    <div className="relative aspect-[4/3] w-20 overflow-hidden rounded-xs bg-paper-deep sm:w-28">
                      {photo ? (
                        <Image
                          src={photoUrl(photo.storage_path)}
                          alt=""
                          fill
                          sizes="(min-width: 640px) 112px, 80px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center label-caps text-taupe">
                          No photo
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <h2 className="text-xl text-ink">
                          {h.registered_name}
                        </h2>
                        <StatusBadge status={h.status} />
                      </div>
                      {h.barn_name && (
                        <p className="text-sm text-dust italic">
                          Barn name: {h.barn_name}
                        </p>
                      )}
                      <p className="mt-1.5 text-sm text-saddle">
                        {meta.length > 0 && <>{meta.join(" · ")} · </>}
                        {h.registration_number ? (
                          <span className="font-mono text-ink">
                            {h.registration_number}
                          </span>
                        ) : (
                          <span className="italic">
                            WHMA number not yet assigned
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-dust">
                        {h.status === "pending" && h.submitted_at
                          ? `Submitted ${formatDate(h.submitted_at)}. Awaiting board review.`
                          : `Updated ${formatDate(h.updated_at)}`}
                      </p>

                      {h.review_note &&
                        (h.status === "changes_requested" ||
                          h.status === "rejected") && (
                          <Alert
                            tone={h.status === "rejected" ? "error" : "warning"}
                            title={
                              h.status === "rejected"
                                ? "Reason from the registration board"
                                : "Changes requested by the registration board"
                            }
                            className="mt-3"
                          >
                            <p className="whitespace-pre-line">
                              {h.review_note}
                            </p>
                          </Alert>
                        )}
                    </div>

                    <HorseActions
                      horseId={h.id}
                      name={h.registered_name}
                      status={h.status}
                      publicHref={
                        h.registration_number
                          ? `/horses/${h.registration_number}`
                          : null
                      }
                      submitAction={submitHorse.bind(null, h.id)}
                      deleteAction={deleteHorse.bind(null, h.id)}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <div className="page-container py-14">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-caps text-3xl text-ink">My horses</h1>
          <p className="mt-1 text-saddle">
            Your registrations and where each one is in the review process.
          </p>
        </div>
        <ButtonLink href="/horses/new">Register a horse</ButtonLink>
      </div>
      <Suspense
        fallback={<p className="text-dust italic">Loading your horses…</p>}
      >
        <Dashboard searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
