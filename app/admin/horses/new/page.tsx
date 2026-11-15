import type { Metadata } from "next";
import Link from "next/link";

import { HorseForm } from "@/app/(member)/horses/horse-form";
import { memberOptions } from "@/lib/admin-lists";
import { requireAdmin } from "@/lib/auth";
import { loadBreeds } from "@/lib/breeds";
import { emptyHorse } from "@/lib/validation/horse";

import { boardSaveHorse, boardSyncPhotos } from "../actions";

export const metadata: Metadata = { title: "Add a horse" };

const noParent = { linked: null, name: "", breedId: null };

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardNewHorsePage() {
  await requireAdmin();
  const [breeds, members] = await Promise.all([loadBreeds(), memberOptions()]);

  return (
    <div className="page-container py-10">
      <Link
        href="/admin/horses"
        className="mb-6 inline-block label-caps text-rust"
      >
        All horses
      </Link>
      <h1 className="heading-caps text-3xl text-ink">Add a horse</h1>
      <p className="mt-2 mb-10 max-w-2xl text-saddle">
        For Foundation horses and records the board enters itself. Horses added
        here are registered straight away, without review.
      </p>
      <HorseForm
        horseId={null}
        mode="board"
        saveAction={boardSaveHorse}
        syncPhotosAction={boardSyncPhotos}
        photoFolder="board"
        returnTo="/admin/horses?saved=1"
        initial={emptyHorse}
        initialSire={noParent}
        initialDam={noParent}
        initialPhotos={[]}
        initialPrimaryKey={null}
        breeds={breeds}
        reviewNote={null}
        board={{
          initial: {
            registration_number: null,
            owner_id: null,
            is_foundation: true,
            registration_date: null,
          },
          members,
        }}
      />
    </div>
  );
}
