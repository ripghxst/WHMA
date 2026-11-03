import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { loadBreeds } from "@/lib/breeds";
import { isEditable, photoUrl } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

import type { ParentOption } from "../../actions";
import { HorseForm } from "../../horse-form";
import type { ParentValue } from "../../parent-field";

export const metadata: Metadata = { title: "Edit horse" };

const parentColumns =
  "id, registered_name, registration_number, is_foundation, breed:breeds!horses_breed_id_fkey(name, is_classified)";

type LinkedParent = {
  id: string;
  registered_name: string;
  registration_number: string | null;
  is_foundation: boolean;
  breed: { name: string; is_classified: boolean } | null;
} | null;

function toParent(
  // Many-to-one self joins come back as an object; the generated types say array.
  joined: NonNullable<LinkedParent> | NonNullable<LinkedParent>[] | null,
  name: string | null,
  breedId: number | null,
): ParentValue {
  const linked = Array.isArray(joined) ? (joined[0] ?? null) : joined;
  const option: ParentOption | null = linked && {
    id: linked.id,
    name: linked.registered_name,
    number: linked.registration_number,
    breed: linked.breed?.name ?? null,
    classified: linked.breed?.is_classified ?? false,
    foundation: linked.is_foundation,
  };
  return { linked: option, name: name ?? "", breedId };
}

async function EditHorse({
  params,
}: {
  params: PageProps<"/horses/[ref]/edit">["params"];
}) {
  const { ref } = await params;
  const { userId } = await requireUser(`/horses/${ref}/edit`);
  if (!/^[0-9a-f-]{36}$/i.test(ref)) notFound();

  const supabase = await createClient();
  // Self-joins embed by column (sire_id / dam_id); a constraint hint is ambiguous here.
  const [{ data: horse, error }, breeds] = await Promise.all([
    supabase
      .from("horses")
      .select(
        `*, horse_photos(storage_path, is_primary, sort_order),
         sire:sire_id(${parentColumns}),
         dam:dam_id(${parentColumns})`,
      )
      .eq("id", ref)
      .eq("owner_id", userId)
      .maybeSingle(),
    loadBreeds(),
  ]);

  if (error) throw error;
  if (!horse) notFound();

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

  const photos = [...horse.horse_photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((p) => ({
      key: p.storage_path,
      kind: "existing" as const,
      path: p.storage_path,
      url: photoUrl(p.storage_path),
    }));
  const primary =
    horse.horse_photos.find((p) => p.is_primary)?.storage_path ??
    photos[0]?.key ??
    null;

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
        userId={userId}
        initial={{
          registered_name: horse.registered_name,
          barn_name: horse.barn_name,
          sex: horse.sex,
          breed_id: horse.breed_id,
          pedigree: horse.pedigree,
          phenotype: horse.phenotype,
          genotype: horse.genotype,
          height: horse.height,
          eye_color: horse.eye_color,
          base_stats: horse.base_stats,
          sire_id: horse.sire_id,
          sire_name: horse.sire_name,
          sire_breed_id: horse.sire_breed_id,
          dam_id: horse.dam_id,
          dam_name: horse.dam_name,
          dam_breed_id: horse.dam_breed_id,
        }}
        initialSire={toParent(horse.sire, horse.sire_name, horse.sire_breed_id)}
        initialDam={toParent(horse.dam, horse.dam_name, horse.dam_breed_id)}
        initialPhotos={photos}
        initialPrimaryKey={primary}
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
      <Suspense fallback={<p className="text-dust italic">Loading…</p>}>
        <EditHorse params={props.params} />
      </Suspense>
    </div>
  );
}
