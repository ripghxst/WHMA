"use client";

import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { RegistryFilters as Filters } from "@/lib/registry";

type Props = {
  filters: Filters;
  breeds: { id: number; name: string; is_classified: boolean }[];
};

const label = "mb-1.5 block label-caps text-saddle";

/**
 * A GET form, so filters live in the URL and work without JavaScript.
 * Keyed by the current URL state so its defaults follow back/forward.
 */
export function RegistryFilters({ filters, breeds }: Props) {
  const active =
    filters.q || filters.breed || filters.sex || filters.foundation;

  return (
    <Form
      action="/registry"
      key={JSON.stringify(filters)}
      role="search"
      onChange={(e) => {
        // Selects and the checkbox apply immediately; text waits for Search.
        if (!(
          e.target instanceof HTMLInputElement && e.target.type !== "checkbox"
        )) {
          e.currentTarget.requestSubmit();
        }
      }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-[1fr_12rem_9rem_9rem_auto] lg:items-end"
    >
      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="registry-q" className={label}>
          Search
        </label>
        <div className="flex gap-2">
          <Input
            id="registry-q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Name or WHMA number"
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </div>
      </div>

      <div className="col-span-2 lg:col-span-1">
        <label htmlFor="registry-breed" className={label}>
          Breed
        </label>
        <Select
          id="registry-breed"
          name="breed"
          defaultValue={filters.breed ?? ""}
        >
          <option value="">All breeds</option>
          {breeds.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="registry-sex" className={label}>
          Sex
        </label>
        <Select id="registry-sex" name="sex" defaultValue={filters.sex ?? ""}>
          <option value="">All</option>
          <option value="stallion">Stallion</option>
          <option value="mare">Mare</option>
          <option value="gelding">Gelding</option>
        </Select>
      </div>

      <div>
        <label htmlFor="registry-sort" className={label}>
          Sort by
        </label>
        <Select id="registry-sort" name="sort" defaultValue={filters.sort}>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="number">WHMA number</option>
        </Select>
      </div>

      <div className="col-span-2 flex h-11 items-center gap-4 lg:col-span-1">
        <label className="flex items-center gap-2 text-sm whitespace-nowrap">
          <input
            type="checkbox"
            name="foundation"
            value="1"
            defaultChecked={filters.foundation}
            className="accent-rust"
          />
          Foundation only
        </label>
        {active && (
          <Link
            href="/registry"
            className="text-sm whitespace-nowrap text-rust underline-offset-4 hover:underline"
          >
            Clear
          </Link>
        )}
      </div>
    </Form>
  );
}
