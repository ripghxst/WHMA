import { cn } from "@/lib/cn";
import type { HorsePedigree } from "@/lib/horse-profile";

type Ancestor = {
  role: string;
  name: string | null;
  breed: string | null;
  number: string | null;
  /** Linked to a registered horse rather than typed in by hand. */
  registered: boolean;
};

function ancestor(
  role: string,
  id: string | null,
  name: string | null,
  breed: string | null,
  number: string | null,
): Ancestor {
  return { role, name, breed, number, registered: Boolean(id) };
}

/** Horse's name and breed in a box. As agreed for v1, names are text, not links. */
function AncestorBox({
  person,
  className,
}: {
  person: Ancestor;
  className?: string;
}) {
  const unknown = !person.name;
  return (
    <div
      className={cn(
        "rounded-xs border px-3.5 py-2.5",
        unknown ? "border-dashed border-taupe" : "border-rule bg-card",
        className,
      )}
    >
      <p className="label-caps text-dust">{person.role}</p>
      {unknown ? (
        <>
          <p className="text-dust italic">Unknown</p>
          {/* Foundation records often know the breed but not the name. */}
          {person.breed && (
            <p className="mt-0.5 text-sm text-saddle">{person.breed}</p>
          )}
        </>
      ) : (
        <>
          <p className="leading-snug text-ink">{person.name}</p>
          <p className="mt-0.5 text-sm text-saddle">
            {person.breed ?? "Breed not recorded"}
            {!person.registered && (
              <span className="text-dust italic"> · not registered</span>
            )}
          </p>
          {person.number && (
            <p className="mt-0.5 font-mono text-xs text-saddle">
              {person.number}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/** Horse → sire and dam → four grandparents. Bracket on desktop, stacked on phones. */
export function PedigreeChart({
  name,
  breed,
  pedigree: p,
}: {
  name: string;
  breed: string | null;
  pedigree: HorsePedigree | null;
}) {
  const sire = ancestor(
    "Sire",
    p?.sire_id ?? null,
    p?.sire_name ?? null,
    p?.sire_breed ?? null,
    p?.sire_number ?? null,
  );
  const dam = ancestor(
    "Dam",
    p?.dam_id ?? null,
    p?.dam_name ?? null,
    p?.dam_breed ?? null,
    p?.dam_number ?? null,
  );
  const sireLine = [
    ancestor(
      "Sire's sire",
      p?.sire_sire_id ?? null,
      p?.sire_sire_name ?? null,
      p?.sire_sire_breed ?? null,
      p?.sire_sire_number ?? null,
    ),
    ancestor(
      "Sire's dam",
      p?.sire_dam_id ?? null,
      p?.sire_dam_name ?? null,
      p?.sire_dam_breed ?? null,
      p?.sire_dam_number ?? null,
    ),
  ];
  const damLine = [
    ancestor(
      "Dam's sire",
      p?.dam_sire_id ?? null,
      p?.dam_sire_name ?? null,
      p?.dam_sire_breed ?? null,
      p?.dam_sire_number ?? null,
    ),
    ancestor(
      "Dam's dam",
      p?.dam_dam_id ?? null,
      p?.dam_dam_name ?? null,
      p?.dam_dam_breed ?? null,
      p?.dam_dam_number ?? null,
    ),
  ];
  const branches = [
    { parent: sire, grandparents: sireLine },
    { parent: dam, grandparents: damLine },
  ];

  return (
    <>
      <div className="pedigree hidden lg:flex">
        <div className="w-56 shrink-0 rounded-xs border border-bark bg-bark px-3.5 py-2.5 text-paper">
          <p className="label-caps text-taupe">This horse</p>
          <p className="leading-snug">{name}</p>
          {breed && <p className="mt-0.5 text-sm text-taupe">{breed}</p>}
        </div>
        <div className="pedigree-children flex-1">
          {branches.map(({ parent, grandparents }) => (
            <div key={parent.role} className="pedigree-child pedigree flex">
              <AncestorBox person={parent} className="w-64 shrink-0" />
              <div className="pedigree-children flex-1">
                {grandparents.map((g) => (
                  <div key={g.role} className="pedigree-child">
                    <AncestorBox person={g} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:hidden">
        {branches.map(({ parent, grandparents }) => (
          <div key={parent.role}>
            <AncestorBox person={parent} />
            <div className="mt-2 ml-4 flex flex-col gap-2 border-l border-taupe pl-4">
              {grandparents.map((g) => (
                <AncestorBox key={g.role} person={g} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
