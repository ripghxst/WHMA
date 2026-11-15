import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HorseForm } from "@/app/(member)/horses/horse-form";
import { StatusBadge } from "@/components/ui/status-badge";
import { memberOptions } from "@/lib/admin-lists";
import { requireAdmin } from "@/lib/auth";
import { loadBreeds } from "@/lib/breeds";
import { loadHorseForForm } from "@/lib/horse-form-data";
import { horseHref } from "@/lib/horses";
import { createClient } from "@/lib/supabase/server";

import { boardSaveHorse, boardSyncPhotos } from "../actions";
import { DeleteHorse } from "./delete-horse";

export const metadata: Metadata = { title: "Edit horse" };

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardEditHorsePage({
  params,
}: PageProps<"/admin/horses/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const [form, breeds, members, { count: offspring }] = await Promise.all([
    loadHorseForForm(id),
    loadBreeds(),
    memberOptions(),
    supabase
      .from("horses")
      .select("id", { count: "exact", head: true })
      .or(`sire_id.eq.${id},dam_id.eq.${id}`),
  ]);
  if (!form) notFound();
  const { horse, ...initialValues } = form;

  return (
    <div className="page-container py-10">
      <Link
        href="/admin/horses"
        className="mb-6 inline-block label-caps text-rust"
      >
        All horses
      </Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-3xl text-ink sm:text-4xl">
          {horse.registered_name}
        </h1>
        <StatusBadge status={horse.status} />
      </div>
      <p className="mt-2 mb-10 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {horse.status === "approved" && (
          <Link
            href={horseHref(horse)}
            className="text-rust underline-offset-4 hover:underline"
          >
            View public profile
          </Link>
        )}
        <Link
          href={`/admin/review/${horse.id}`}
          className="text-rust underline-offset-4 hover:underline"
        >
          {horse.status === "pending"
            ? "Review this submission"
            : "Review history"}
        </Link>
      </p>

      <HorseForm
        horseId={horse.id}
        mode="board"
        saveAction={boardSaveHorse}
        syncPhotosAction={boardSyncPhotos}
        photoFolder="board"
        returnTo="/admin/horses?saved=1"
        {...initialValues}
        breeds={breeds}
        reviewNote={null}
        board={{
          initial: {
            registration_number: horse.registration_number,
            owner_id: horse.owner_id,
            is_foundation: horse.is_foundation,
            registration_date: horse.registration_date,
          },
          members,
        }}
      />

      <section className="mt-16 rounded-xs border border-rejected/40 p-5">
        <h2 className="heading-caps text-xl text-rejected">Delete</h2>
        <p className="mt-1 mb-4 text-sm text-saddle">
          Removes the horse from the registry for good.
        </p>
        <DeleteHorse
          horseId={horse.id}
          name={horse.registered_name}
          offspring={offspring ?? 0}
        />
      </section>
    </div>
  );
}
