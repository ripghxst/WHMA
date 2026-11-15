import type { Metadata } from "next";

import { loadBreeds } from "@/lib/breeds";
import { createClient } from "@/lib/supabase/server";

import { AddBreedForm } from "./add-breed-form";

export const metadata: Metadata = { title: "Breeds" };

// Rendered inside the admin layout's Suspense boundary and admin check.
export default async function BoardBreedsPage() {
  const supabase = await createClient();
  const [breeds, { data: codes }] = await Promise.all([
    loadBreeds(),
    supabase.from("breeds").select("id, code"),
  ]);
  const codeFor = new Map(codes?.map((c) => [c.id, c.code]));

  return (
    <div className="page-container py-10">
      <h1 className="heading-caps text-3xl text-ink">Breeds</h1>
      <p className="mt-2 max-w-2xl text-saddle">
        The breeds members can choose. Classified breeds qualify a horse for
        registration; their code goes into the WHMA number.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 border-b border-rule pb-3 heading-caps text-xl text-dust">
            Add a breed
          </h2>
          <AddBreedForm />
        </section>

        <section>
          <h2 className="mb-2 border-b border-rule pb-3 heading-caps text-xl text-dust">
            {breeds.length} breeds
          </h2>
          <ul>
            {breeds.map((b) => (
              <li
                key={b.id}
                className="flex items-baseline gap-4 border-b border-rule py-2"
              >
                <span className="w-8 font-mono text-sm text-rust">
                  {codeFor.get(b.id)}
                </span>
                <span className="flex-1">{b.name}</span>
                {b.is_classified && (
                  <span className="label-caps text-dust">Classified</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
