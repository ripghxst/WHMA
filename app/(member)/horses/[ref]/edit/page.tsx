import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { loadBreeds } from "@/lib/breeds";
import { loadHorseForForm } from "@/lib/horse-form-data";
import { isEditable } from "@/lib/horses";

import { saveHorse, syncPhotos } from "../../actions";
import { HorseForm } from "../../horse-form";

export const metadata: Metadata = { title: "Edit horse" };

async function EditHorse({
  params,
}: {
  params: PageProps<"/horses/[ref]/edit">["params"];
}) {
  const { ref } = await params;
  const { userId } = await requireUser(`/horses/${ref}/edit`);
  const [form, breeds] = await Promise.all([
    loadHorseForForm(ref, userId),
    loadBreeds(),
  ]);
  if (!form) notFound();
  const { horse, ...initialValues } = form;

  if (!isEditable(horse.status)) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="heading-caps text-3xl text-ink">
            {horse.registered_name}
          </h1>
          <StatusBadge status={horse.status} />
        </div>
        <Alert className="mt-8" title="This horse can't be edited">
          {horse.status === "pending"
            ? "It's with the registration board for review. You'll be able to make changes if the board asks for them."
            : horse.status === "approved"
              ? "It's registered. If something needs correcting, contact the registration team."
              : "The registration board denied this registration."}
        </Alert>
        <ButtonLink href="/dashboard" variant="secondary" className="mt-6">
          Back to my horses
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <h1 className="heading-caps text-3xl text-ink">
        Edit {horse.registered_name}
      </h1>
      <p className="mt-2 mb-10 max-w-2xl text-saddle">
        Update the details, then submit the horse for review when it&apos;s
        ready.
      </p>
      <HorseForm
        horseId={horse.id}
        mode="member"
        saveAction={saveHorse}
        syncPhotosAction={syncPhotos}
        photoFolder={userId}
        returnTo="/dashboard"
        {...initialValues}
        breeds={breeds}
        reviewNote={
          horse.status === "changes_requested" ? horse.review_note : null
        }
      />
    </>
  );
}

export default function EditHorsePage(props: PageProps<"/horses/[ref]/edit">) {
  return (
    <div className="page-container py-14">
      <Suspense fallback={<PageLoading />}>
        <EditHorse params={props.params} />
      </Suspense>
    </div>
  );
}
