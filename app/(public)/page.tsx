import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/panel";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatDate, sampleEntries } from "@/lib/sample-entries";
import { classifiedBreeds, site } from "@/lib/site";

const numberParts = [
  { part: "WHMA", label: "Association" },
  { part: "AM", label: "Breed code — American Mustang" },
  { part: "2", label: "Classified parents — 1 if one, 2 if both" },
  { part: "314625", label: "Registration sequence" },
];

export default function HomePage() {
  return (
    <div className="page-container">
      <section className="grid gap-12 pt-14 pb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pt-20">
        <div>
          <h1 className="text-3xl sm:text-4xl">The Horse Registry</h1>
          <p className="mt-5 max-w-xl text-lg text-saddle">
            The public record of horses registered with the WHMA. Each entry is
            reviewed by the registration board to confirm its wild-horse
            heritage before it is written into the book.
          </p>

          <form action="/registry" className="mt-8 max-w-xl">
            <label htmlFor="home-search" className="label-caps text-saddle">
              Search the registry
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="home-search"
                name="q"
                type="search"
                placeholder="Name or WHMA number"
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink href="/horses/new" variant="secondary">
              Register a horse
            </ButtonLink>
            <a
              href={site.criteriaUrl}
              className="text-rust underline decoration-rule underline-offset-4 hover:decoration-rust"
            >
              Read the registration criteria ↗
            </a>
          </div>
        </div>

        <aside
          aria-labelledby="number-heading"
          className="self-start rounded-xs border border-rule bg-card p-6 shadow-card sm:p-8"
        >
          <h2 id="number-heading" className="label-caps text-saddle">
            Reading a registration number
          </h2>
          <p className="mt-6 flex flex-wrap items-baseline font-mono text-2xl text-ink sm:text-3xl">
            <span>WHMA</span>
            <span className="text-taupe">-</span>
            <span>AM</span>
            <span className="text-rust">2</span>
            <span className="text-taupe">-</span>
            <span>314625</span>
          </p>
          <dl className="mt-6 divide-y divide-rule border-t border-rule">
            {numberParts.map(({ part, label }) => (
              <div key={part} className="flex gap-4 py-2.5">
                <dt className="w-20 shrink-0 font-mono text-sm text-ink">
                  {part}
                </dt>
                <dd className="text-sm text-saddle">{label}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section aria-labelledby="recent-heading">
        <SectionHeading
          action={
            <Link
              href="/registry"
              className="text-sm text-rust hover:text-rust-deep"
            >
              Browse the full registry →
            </Link>
          }
        >
          <span id="recent-heading">Recent entries</span>
        </SectionHeading>

        <div className="mt-6 hidden sm:block">
          <Table>
            <THead>
              <tr>
                <TH>WHMA No.</TH>
                <TH>Registered name</TH>
                <TH>Breed</TH>
                <TH className="hidden md:table-cell">Sex</TH>
                <TH className="hidden lg:table-cell">Coat</TH>
                <TH className="hidden md:table-cell">Owner</TH>
                <TH className="text-right">Entered</TH>
              </tr>
            </THead>
            <TBody>
              {sampleEntries.map((h) => (
                <TR key={h.number}>
                  <TD className="font-mono text-sm whitespace-nowrap">
                    {h.number}
                  </TD>
                  <TD className="text-ink">{h.name}</TD>
                  <TD>{h.breed}</TD>
                  <TD className="hidden md:table-cell">{h.sex}</TD>
                  <TD className="hidden text-saddle lg:table-cell">{h.coat}</TD>
                  <TD className="hidden md:table-cell">{h.owner}</TD>
                  <TD className="text-right text-sm whitespace-nowrap text-dust">
                    {formatDate(h.date)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <ul className="mt-6 border-y border-bark sm:hidden">
          {sampleEntries.map((h) => (
            <li
              key={h.number}
              className="border-b border-rule py-3 last:border-b-0"
            >
              <p className="text-ink">{h.name}</p>
              <p className="mt-0.5 font-mono text-xs text-saddle">{h.number}</p>
              <p className="mt-1 text-sm text-dust">
                {h.breed} · {h.sex} · {formatDate(h.date)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="breeds-heading"
        className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]"
      >
        <div>
          <h2 id="breeds-heading" className="text-2xl">
            Classified breeds
          </h2>
          <p className="mt-3 text-saddle">
            A horse can be registered when at least one of its parents, the sire
            or the dam, is one of these breeds.
          </p>
        </div>
        <ul className="grid grid-cols-1 border-t border-bark sm:grid-cols-2">
          {classifiedBreeds.map((b) => (
            <li
              key={b.code}
              className="flex items-baseline gap-4 border-b border-rule py-3 sm:pr-6"
            >
              <span className="w-8 font-mono text-sm text-rust">{b.code}</span>
              <span>{b.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
