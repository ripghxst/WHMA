import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PedigreeChart } from "@/components/horses/pedigree-chart";
import { PhotoGallery } from "@/components/horses/photo-gallery";
import { RecordDetail } from "@/components/horses/record-detail";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/status-badge";
import { loadSubmission } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { horseHref, photoUrl, sexLabel } from "@/lib/horses";

import { reviewHorse } from "../actions";
import { ReviewForm } from "./review-form";

export const metadata: Metadata = { title: "Review a horse" };

const actionLabels = {
  submitted: "Submitted by the member",
  approved: "Approved",
  changes_requested: "Sent back for changes",
  rejected: "Denied",
  edited: "Edited by the board",
} as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-4 border-b border-rule pb-3 heading-caps text-xl text-dust sm:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function ReviewPage({
  params,
}: PageProps<"/admin/review/[id]">) {
  const { id } = await params;
  const submission = await loadSubmission(id);
  if (!submission) notFound();

  const { horse, pedigree, history, proposedNumber, ineligible } = submission;
  const photos = [...horse.horse_photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((p) => ({ url: photoUrl(p.storage_path) }));

  return (
    <div className="page-container py-10">
      <Link
        href="/admin/review"
        className="mb-6 inline-block label-caps text-rust"
      >
        Review queue
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-3xl text-ink sm:text-4xl">
          {horse.registered_name}
        </h1>
        <StatusBadge status={horse.status} />
      </div>
      {horse.submitted_at && (
        <p className="mt-1 text-sm text-dust">
          Submitted {formatDate(horse.submitted_at)}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          {photos.length > 0 ? (
            <PhotoGallery photos={photos} name={horse.registered_name} />
          ) : (
            <Alert tone="warning">This submission has no photos.</Alert>
          )}

          <Section title="Registration details">
            <dl>
              <RecordDetail label="Barn name">{horse.barn_name}</RecordDetail>
              <RecordDetail label="Sex">{sexLabel(horse.sex)}</RecordDetail>
              <RecordDetail label="Listed breed">
                {horse.breed?.name}
              </RecordDetail>
              <RecordDetail label="Pedigree">{horse.pedigree}</RecordDetail>
              <RecordDetail label="Coat">{horse.phenotype}</RecordDetail>
              <RecordDetail label="Genotype" mono>
                {horse.genotype}
              </RecordDetail>
              <RecordDetail label="Height">{horse.height}</RecordDetail>
              <RecordDetail label="Eye colour">{horse.eye_color}</RecordDetail>
              <RecordDetail label="Base stats" mono>
                {horse.base_stats}
              </RecordDetail>
            </dl>
          </Section>
        </div>

        <aside className="flex flex-col gap-8">
          <section className="rounded-xs border border-rule bg-card p-5">
            <h2 className="mb-3 label-caps text-saddle">Owner</h2>
            {horse.owner ? (
              <>
                <p className="text-lg text-ink">{horse.owner.display_name}</p>
                <dl className="mt-1 text-sm">
                  {horse.owner.in_game_name && (
                    <div className="flex gap-2">
                      <dt className="text-dust">In game</dt>
                      <dd>{horse.owner.in_game_name}</dd>
                    </div>
                  )}
                  {horse.owner.discord_username && (
                    <div className="flex gap-2">
                      <dt className="text-dust">Discord</dt>
                      <dd className="font-mono">
                        {horse.owner.discord_username}
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="text-dust italic">
                {horse.legacy_owner_name ?? "No owner on record"}
              </p>
            )}
          </section>

          {horse.status === "pending" ? (
            <section className="rounded-xs border border-bark bg-card p-5">
              <h2 className="mb-4 heading-caps text-xl text-ink">
                Your decision
              </h2>
              {ineligible && (
                <Alert
                  tone="warning"
                  title="Check eligibility"
                  className="mb-5"
                >
                  Neither parent is recorded as a classified breed. WHMA
                  registers horses with at least one classified parent.
                </Alert>
              )}
              <ReviewForm
                action={reviewHorse.bind(null, horse.id)}
                proposedNumber={proposedNumber}
                ineligible={ineligible}
              />
            </section>
          ) : (
            <Alert title="Already reviewed">
              {horse.status === "approved" ? (
                <>
                  Registered as{" "}
                  <Link href={horseHref(horse)} className="font-mono underline">
                    {horse.registration_number}
                  </Link>
                  .
                </>
              ) : horse.status === "draft" ? (
                "This horse is a draft and hasn't been submitted."
              ) : (
                "This horse is not waiting for a decision."
              )}
            </Alert>
          )}
        </aside>
      </div>

      <Section title="Pedigree">
        <PedigreeChart
          name={horse.registered_name}
          breed={horse.breed?.name ?? null}
          pedigree={pedigree}
        />
      </Section>

      <Section title="History">
        {history.length === 0 ? (
          <p className="text-dust italic">No history yet.</p>
        ) : (
          <ol className="border-l border-taupe pl-5">
            {history.map((h) => (
              <li key={h.id} className="relative pb-5 last:pb-0">
                <span
                  className="absolute top-2 -left-[1.6rem] h-2 w-2 rounded-full bg-saddle"
                  aria-hidden
                />
                <p className="text-ink">
                  {actionLabels[h.action]}
                  {h.actor && h.action !== "submitted" && (
                    <span className="text-dust">
                      {" "}
                      by {h.actor.display_name}
                    </span>
                  )}
                </p>
                <p className="text-sm text-dust">{formatDate(h.created_at)}</p>
                {h.note && (
                  <p className="mt-1 whitespace-pre-line text-saddle">
                    {h.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
