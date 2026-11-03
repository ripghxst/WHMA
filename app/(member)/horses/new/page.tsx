import type { Metadata } from "next";
import { Suspense } from "react";

import { requireUser } from "@/lib/auth";
import { emptyHorse } from "@/lib/validation/horse";

import { HorseForm } from "../horse-form";
import { loadBreeds } from "../load";

export const metadata: Metadata = { title: "Register a horse" };

async function NewHorse() {
  const { userId } = await requireUser("/horses/new");
  const breeds = await loadBreeds();
  const noParent = { linked: null, name: "", breedId: null };

  return (
    <HorseForm
      horseId={null}
      userId={userId}
      initial={emptyHorse}
      initialSire={noParent}
      initialDam={noParent}
      initialPhotos={[]}
      initialPrimaryKey={null}
      breeds={breeds}
      reviewNote={null}
    />
  );
}

export default function NewHorsePage() {
  return (
    <div className="page-container py-14">
      <h1 className="heading-caps text-3xl text-ink">Register a horse</h1>
      <p className="mt-2 mb-10 max-w-2xl text-saddle">
        Fill in your horse&apos;s details as they appear in game. You can save a
        draft and come back later. Once submitted, the registration board will
        review it.
      </p>
      <Suspense
        fallback={<p className="text-dust italic">Loading the form…</p>}
      >
        <NewHorse />
      </Suspense>
    </div>
  );
}
