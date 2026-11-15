import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageLoading } from "@/components/ui/page-loading";
import { PageBanner } from "@/components/layout/page-banner";
import { RegistryList } from "@/components/registry/registry-list";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { loadBreeds } from "@/lib/breeds";
import {
  PAGE_SIZE,
  listRegistry,
  parseFilters,
  registryHref,
} from "@/lib/registry";
import herdDesert from "@/public/images/herd-desert.jpg";

import { RegistryFilters } from "./registry-filters";

export const metadata: Metadata = {
  title: "The Registry",
  description:
    "Search every horse registered with the Wild Horse & Mustang Association.",
};

async function Registry({
  searchParams,
}: {
  searchParams: PageProps<"/registry">["searchParams"];
}) {
  const filters = parseFilters(await searchParams);
  const [{ horses, total, outOfRange }, breeds] = await Promise.all([
    listRegistry(filters),
    loadBreeds(),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters =
    filters.q || filters.breed || filters.sex || filters.foundation;

  return (
    <>
      <RegistryFilters filters={filters} breeds={breeds} />

      <p className="mt-8 mb-3 text-sm text-dust" aria-live="polite">
        {!outOfRange &&
          `${total} ${total === 1 ? "horse" : "horses"}${hasFilters ? " found" : " registered"}`}
      </p>

      {outOfRange ? (
        <EmptyState title="That page doesn't exist">
          <Link
            href={registryHref(filters, 1)}
            className="text-rust underline underline-offset-4"
          >
            Back to the first page
          </Link>
        </EmptyState>
      ) : horses.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No horses match" : "No horses registered yet"}
        >
          {hasFilters
            ? "Try a different name or fewer filters."
            : "Approved horses will be listed here."}
        </EmptyState>
      ) : (
        <>
          <RegistryList horses={horses} />
          <div className="mt-8">
            <Pagination
              page={filters.page}
              totalPages={totalPages}
              hrefForPage={(p) => registryHref(filters, p)}
            />
          </div>
        </>
      )}
    </>
  );
}

export default function RegistryPage(props: PageProps<"/registry">) {
  return (
    <>
      <PageBanner title="The Registry" image={herdDesert} position="50% 35%">
        Every horse registered with the Wild Horse &amp; Mustang Association.
      </PageBanner>

      <div className="page-container pt-8">
        <Suspense fallback={<PageLoading label="Loading the registry…" />}>
          <Registry searchParams={props.searchParams} />
        </Suspense>
      </div>
    </>
  );
}
