import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Pagination } from "@/components/ui/pagination";
import { Panel, SectionHeading } from "@/components/ui/panel";
import { StatusBadge, type HorseStatus } from "@/components/ui/status-badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { sampleEntries } from "@/lib/sample-entries";
import { classifiedBreeds } from "@/lib/site";

import { DialogDemo } from "./dialog-demo";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false },
};

const colors = [
  ["paper", "bg-paper"],
  ["paper-deep", "bg-paper-deep"],
  ["card", "bg-card"],
  ["rule", "bg-rule"],
  ["taupe", "bg-taupe"],
  ["dust", "bg-dust"],
  ["saddle", "bg-saddle"],
  ["bark", "bg-bark"],
  ["ink", "bg-ink"],
  ["rust", "bg-rust"],
  ["pending", "bg-pending"],
  ["changes", "bg-changes"],
  ["approved", "bg-approved"],
  ["rejected", "bg-rejected"],
] as const;

const typeScale = [
  ["text-4xl", "The Horse Registry"],
  ["text-3xl", "Classified breeds"],
  ["text-2xl", "[WCRX] Knight's Rules Apply"],
  ["text-xl", "Pedigree"],
  ["text-lg", "Lead paragraph text for introductions."],
  ["text-base", "Body text. Registered horses are reviewed by the board."],
  ["text-sm", "Secondary text, captions and hints."],
] as const;

const statuses: HorseStatus[] = [
  "draft",
  "pending",
  "changes_requested",
  "approved",
  "rejected",
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <SectionHeading>{title}</SectionHeading>
      {children}
    </section>
  );
}

// Development-only reference page for reviewing the design system.
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="page-container flex flex-col gap-16 py-14">
      <header>
        <p className="label-caps text-rust">Development only</p>
        <h1 className="mt-2 heading-caps text-3xl text-ink">Style guide</h1>
        <p className="mt-3 max-w-2xl text-saddle">
          Every token and component used by the registry. See tasks/DESIGN.md
          for the rules.
        </p>
      </header>

      <Section title="Colour">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {colors.map(([name, bg]) => (
            <li key={name}>
              <div className={`h-16 rounded-xs border border-rule ${bg}`} />
              <p className="mt-2 font-mono text-xs">{name}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-4">
          {typeScale.map(([size, sample]) => (
            <div
              key={size}
              className="flex items-baseline gap-6 border-b border-rule pb-3"
            >
              <span className="w-20 shrink-0 font-mono text-xs text-dust">
                {size}
              </span>
              <span className={`${size} text-ink`}>{sample}</span>
            </div>
          ))}
          <div className="flex items-baseline gap-6 border-b border-rule pb-3">
            <span className="w-20 shrink-0 font-mono text-xs text-dust">
              heading-caps
            </span>
            <span className="heading-caps text-2xl text-dust">
              Recent registrations
            </span>
          </div>
          <div className="flex items-baseline gap-6 border-b border-rule pb-3">
            <span className="w-20 shrink-0 font-mono text-xs text-dust">
              label-caps
            </span>
            <span className="label-caps text-saddle">
              Registered horse&apos;s name
            </span>
          </div>
          <div className="flex items-baseline gap-6 border-b border-rule pb-3">
            <span className="w-20 shrink-0 font-mono text-xs text-dust">
              font-mono
            </span>
            <span className="font-mono!">
              WHMA-KM1-526134 · B_CR_RN · [9-9] 9/8/9/8
            </span>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Submit for review</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Deny</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <ButtonLink href="/registry" variant="secondary" size="sm">
            Link button
          </ButtonLink>
        </div>
      </Section>

      <Section title="Form fields">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            id="sg-name"
            label="Registered name"
            hint="Include the brand, e.g. [WCRX]"
            required
          >
            <Input placeholder="[WCRX] Knight's Rules Apply" />
          </Field>
          <Field id="sg-breed" label="Listed breed" required>
            <Select defaultValue="">
              <option value="" disabled>
                Choose a breed
              </option>
              {classifiedBreeds.map((b) => (
                <option key={b.code}>{b.name}</option>
              ))}
            </Select>
          </Field>
          <Field
            id="sg-geno"
            label="Genotype"
            error="Use the in-game breeding code, e.g. B_CR_RN"
          >
            <Input defaultValue="buckskin roan" className="font-mono!" />
          </Field>
          <Field
            id="sg-disabled"
            label="WHMA number"
            hint="Assigned by the board on approval"
          >
            <Input disabled placeholder="Not yet assigned" />
          </Field>
          <Field
            id="sg-notes"
            label="Notes for the board"
            className="md:col-span-2"
          >
            <Textarea placeholder="Anything the registration team should know" />
          </Field>
        </div>
      </Section>

      <Section title="Status">
        <div className="flex flex-wrap gap-3">
          {statuses.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </Section>

      <Section title="Alerts">
        <div className="grid gap-4 md:grid-cols-2">
          <Alert title="Awaiting review">
            A board member will look over your submission.
          </Alert>
          <Alert tone="success" title="Horse approved">
            WHMA-AM2-314625 has been entered into the registry.
          </Alert>
          <Alert tone="warning" title="Changes requested">
            Please add the dam&apos;s breed and a clearer photo.
          </Alert>
          <Alert tone="error" title="Could not save">
            Check the highlighted fields and try again.
          </Alert>
        </div>
      </Section>

      <Section title="Table">
        <Table>
          <THead>
            <tr>
              <TH>WHMA No.</TH>
              <TH>Registered name</TH>
              <TH>Breed</TH>
              <TH>Status</TH>
              <TH className="text-right">Entered</TH>
            </tr>
          </THead>
          <TBody>
            {sampleEntries.slice(0, 3).map((h, i) => (
              <TR key={h.number}>
                <TD className="font-mono text-sm">{h.number}</TD>
                <TD className="text-ink">{h.name}</TD>
                <TD>{h.breed}</TD>
                <TD>
                  <StatusBadge status={i === 0 ? "pending" : "approved"} />
                </TD>
                <TD className="text-right text-sm text-dust">
                  {formatDate(h.date)}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Section>

      <Section title="Panel & empty state">
        <div className="grid gap-6 md:grid-cols-2">
          <Panel
            title="Sire"
            actions={
              <Button variant="ghost" size="sm">
                Change
              </Button>
            }
          >
            <p className="text-lg text-ink">[WCRX] House Rules Apply</p>
            <p className="text-sm text-dust">Mustang · WHMA-AM2-000000</p>
          </Panel>
          <EmptyState
            title="No horses yet"
            action={
              <ButtonLink href="/horses/new">Register a horse</ButtonLink>
            }
          >
            Horses you register will be listed here with their review status.
          </EmptyState>
        </div>
      </Section>

      <Section title="Pagination">
        <Pagination
          page={4}
          totalPages={9}
          hrefForPage={(p) => `/styleguide?page=${p}`}
        />
      </Section>

      <Section title="Confirm dialog">
        <DialogDemo />
      </Section>
    </div>
  );
}
