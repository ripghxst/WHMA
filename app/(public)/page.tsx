import Image from "next/image";
import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { sampleEntries } from "@/lib/sample-entries";
import { classifiedBreeds, site } from "@/lib/site";
import herdRunning from "@/public/images/herd-running.jpg";
import herdDesert from "@/public/images/herd-desert.jpg";

const numberParts = [
  { part: "WHMA", label: "Association prefix" },
  { part: "AM", label: "Breed code, here American Mustang" },
  { part: "2", label: "Classified parents: 1 for one, 2 for both" },
  { part: "314625", label: "Registration sequence" },
];

/** Uppercase section title with a hairline under it, as on the WHMA website. */
function SectionTitle({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="border-b border-rule pb-3 heading-caps text-xl text-dust sm:text-2xl"
    >
      {children}
    </h2>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink">
        <Image
          src={herdRunning}
          alt=""
          priority
          placeholder="blur"
          sizes="100vw"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%] opacity-70"
        />
        <div
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/40 to-ink/10"
          aria-hidden
        />

        <div className="page-container flex min-h-[26rem] flex-col justify-end pt-24 pb-12 sm:min-h-[32rem] sm:pb-16">
          <p className="label-caps text-taupe">
            Wild Horse &amp; Mustang Association
          </p>
          <h1 className="mt-2 heading-caps text-4xl text-paper sm:text-[4.5rem] sm:leading-none">
            Horse Registry
          </h1>
          <p className="mt-4 max-w-xl text-lg text-paper/85">
            The public record of every horse registered with the WHMA, with its
            breeding, genetics and parentage.
          </p>

          <form
            action="/registry"
            role="search"
            className="mt-8 flex max-w-xl gap-2"
          >
            <label htmlFor="home-search" className="sr-only">
              Search the registry
            </label>
            <Input
              id="home-search"
              name="q"
              type="search"
              placeholder="Name or WHMA number"
              className="flex-1 border-transparent"
            />
            <Button type="submit" className="bg-rust hover:bg-rust-deep">
              Search
            </Button>
          </form>
        </div>
      </section>

      <div className="page-container">
        <section aria-labelledby="recent-heading" className="pt-16">
          <div className="flex items-end justify-between gap-4 border-b border-rule pb-3">
            <h2
              id="recent-heading"
              className="heading-caps text-xl text-dust sm:text-2xl"
            >
              Recent registrations
            </h2>
            <Link
              href="/registry"
              className="shrink-0 label-caps text-rust hover:text-rust-deep"
            >
              View all
            </Link>
          </div>

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
                  <TH className="text-right">Registered</TH>
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
                    <TD className="hidden text-saddle lg:table-cell">
                      {h.coat}
                    </TD>
                    <TD className="hidden md:table-cell">{h.owner}</TD>
                    <TD className="text-right text-sm whitespace-nowrap text-dust">
                      {formatDate(h.date)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <ul className="mt-4 sm:hidden">
            {sampleEntries.map((h) => (
              <li key={h.number} className="border-b border-rule py-3">
                <p className="text-ink">{h.name}</p>
                <p className="mt-0.5 font-mono text-xs text-saddle">
                  {h.number}
                </p>
                <p className="mt-1 text-sm text-dust">
                  {h.breed}, {h.sex.toLowerCase()} · {formatDate(h.date)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="register-heading"
          className="mt-20 grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <Image
            src={herdDesert}
            alt="A herd of wild horses crossing desert scrub"
            placeholder="blur"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[16/10] w-full rounded-xs object-cover"
          />
          <div>
            <SectionTitle id="register-heading">
              Register your horse
            </SectionTitle>
            <p className="mt-5 text-lg text-saddle">
              Create a member account and submit your horse with its photos,
              genetics and parents. A senior board member will look over the
              submission and approve it, ask for adjustments, or deny it with a
              reason.
            </p>
            <p className="mt-4 text-saddle">
              Approved horses receive a WHMA number and are added to the public
              registry.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/horses/new">Register a horse</ButtonLink>
              <a
                href={site.criteriaUrl}
                className="text-rust underline decoration-rule underline-offset-4 hover:decoration-rust"
              >
                Registration criteria
              </a>
            </div>
          </div>
        </section>

        <div className="mt-20 grid gap-14 lg:grid-cols-2">
          <section aria-labelledby="number-heading">
            <SectionTitle id="number-heading">
              Registration numbers
            </SectionTitle>
            <p className="mt-6 font-mono text-2xl tracking-wide text-ink sm:text-3xl">
              WHMA<span className="text-taupe">-</span>AM
              <span className="text-rust">2</span>
              <span className="text-taupe">-</span>314625
            </p>
            <dl className="mt-5">
              {numberParts.map(({ part, label }) => (
                <div
                  key={part}
                  className="flex gap-4 border-b border-rule py-2.5"
                >
                  <dt className="w-20 shrink-0 font-mono text-sm text-ink">
                    {part}
                  </dt>
                  <dd className="text-saddle">{label}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="breeds-heading">
            <SectionTitle id="breeds-heading">Classified breeds</SectionTitle>
            <p className="mt-5 text-saddle">
              At least one parent, the sire or the dam, must be one of these
              breeds.
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8">
              {classifiedBreeds.map((b) => (
                <li
                  key={b.code}
                  className="flex items-baseline gap-4 border-b border-rule py-2.5"
                >
                  <span className="w-7 font-mono text-sm text-rust">
                    {b.code}
                  </span>
                  <span>{b.name}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
