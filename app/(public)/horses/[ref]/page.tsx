import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PedigreeChart } from "@/components/horses/pedigree-chart";
import { PhotoGallery } from "@/components/horses/photo-gallery";
import { formatDate } from "@/lib/format";
import { loadHorse } from "@/lib/horse-profile";
import { photoUrl, primaryPhoto, sexLabel } from "@/lib/horses";

export async function generateMetadata({
  params,
}: PageProps<"/horses/[ref]">): Promise<Metadata> {
  const { ref } = await params;
  const profile = await loadHorse(decodeURIComponent(ref));
  if (!profile) return { title: "No record found" };

  const { horse } = profile;
  const photo = primaryPhoto(horse.horse_photos);
  const description = [
    horse.registration_number,
    horse.breed?.name,
    sexLabel(horse.sex),
    horse.phenotype,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    title: horse.registered_name,
    description,
    openGraph: {
      title: horse.registered_name,
      description,
      images: photo ? [photoUrl(photo.storage_path)] : undefined,
    },
  };
}

function Detail({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-b border-rule py-2.5 last:border-b-0">
      <dt className="pt-0.5 label-caps text-saddle">{label}</dt>
      <dd className={mono ? "font-mono text-sm text-ink" : "text-ink"}>
        {children || <span className="text-dust">Not recorded</span>}
      </dd>
    </div>
  );
}

async function HorseProfile({
  params,
}: {
  params: PageProps<"/horses/[ref]">["params"];
}) {
  const { ref } = await params;
  const profile = await loadHorse(decodeURIComponent(ref));
  if (!profile) notFound();

  const { horse, pedigree, offspring } = profile;
  const photos = [...horse.horse_photos]
    .sort((a, b) => a.sort_order - b.sort_order)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((p) => ({ url: photoUrl(p.storage_path) }));
  const registered = horse.registration_date ?? horse.reviewed_at;
  const ownerLabel = horse.owner
    ? (horse.owner.in_game_name ?? horse.owner.display_name)
    : horse.legacy_owner_name;

  return (
    <>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-3xl text-ink sm:text-4xl">
          {horse.registered_name}
        </h1>
        {horse.is_foundation && (
          <span className="inline-flex rounded-xs border-[3px] border-double border-bark bg-paper-deep px-2 py-0.5 label-caps whitespace-nowrap text-bark">
            Foundation horse
          </span>
        )}
      </header>
      {horse.registration_number && (
        <p className="mt-1 font-mono text-saddle">
          {horse.registration_number}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} name={horse.registered_name} />
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 self-start rounded-xs bg-paper-deep">
            <Image
              src="/brand/whma-logo.png"
              alt=""
              width={96}
              height={100}
              className="opacity-20"
            />
            <p className="text-sm text-dust italic">No photo on file</p>
          </div>
        )}

        <section aria-labelledby="record-heading">
          <h2
            id="record-heading"
            className="border-b border-rule pb-3 heading-caps text-xl text-dust sm:text-2xl"
          >
            Registration record
          </h2>
          <dl>
            <Detail label="WHMA number" mono>
              {horse.registration_number ??
                (horse.is_foundation && "Foundation")}
            </Detail>
            <Detail label="Barn name">{horse.barn_name}</Detail>
            <Detail label="Sex">{sexLabel(horse.sex)}</Detail>
            <Detail label="Listed breed">{horse.breed?.name}</Detail>
            <Detail label="Pedigree">{horse.pedigree}</Detail>
            <Detail label="Coat">{horse.phenotype}</Detail>
            <Detail label="Genotype" mono>
              {horse.genotype}
            </Detail>
            <Detail label="Height">{horse.height}</Detail>
            <Detail label="Eye colour">{horse.eye_color}</Detail>
            <Detail label="Base stats" mono>
              {horse.base_stats}
            </Detail>
            <Detail label="Registered">
              {registered && formatDate(registered)}
            </Detail>
            <Detail label="Owner">
              {horse.owner ? (
                <Link
                  href={`/members/${horse.owner.id}`}
                  className="text-rust underline decoration-rule underline-offset-4 hover:decoration-rust"
                >
                  {ownerLabel}
                </Link>
              ) : (
                (ownerLabel ?? (horse.is_foundation && "WHMA Foundation"))
              )}
            </Detail>
          </dl>
        </section>
      </div>

      <section aria-labelledby="pedigree-heading" className="mt-16">
        <h2
          id="pedigree-heading"
          className="mb-6 border-b border-rule pb-3 heading-caps text-xl text-dust sm:text-2xl"
        >
          Pedigree
        </h2>
        <PedigreeChart
          name={horse.registered_name}
          breed={horse.breed?.name ?? null}
          pedigree={pedigree}
        />
      </section>

      <section aria-labelledby="offspring-heading" className="mt-16">
        <h2
          id="offspring-heading"
          className="mb-4 border-b border-rule pb-3 heading-caps text-xl text-dust sm:text-2xl"
        >
          Offspring
        </h2>
        {offspring.length === 0 ? (
          <p className="text-dust italic">No registered offspring.</p>
        ) : (
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {offspring.map((o) => (
              <li
                key={o.id}
                className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
              >
                <span className="text-ink">{o.registered_name}</span>
                <span className="shrink-0 font-mono text-xs text-saddle">
                  {o.registration_number}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function HorsePage(props: PageProps<"/horses/[ref]">) {
  return (
    <div className="page-container pt-10">
      <Link
        href="/registry"
        className="mb-6 inline-block label-caps text-rust hover:text-rust-deep"
      >
        The registry
      </Link>
      <Suspense fallback={<p className="py-12 text-dust italic">Loading…</p>}>
        <HorseProfile params={props.params} />
      </Suspense>
    </div>
  );
}
