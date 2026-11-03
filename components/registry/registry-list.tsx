import Link from "next/link";

import { HorseThumb } from "@/components/registry/horse-thumb";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { horseHref, sexLabel } from "@/lib/horses";
import { ownerName, registeredOn, type RegistryHorse } from "@/lib/registry";

function HorseNumber({ horse }: { horse: RegistryHorse }) {
  if (horse.registration_number) return <>{horse.registration_number}</>;
  return horse.is_foundation ? <>Foundation</> : <>&mdash;</>;
}

/** Register-style table on larger screens, stacked records on phones. */
export function RegistryList({ horses }: { horses: RegistryHorse[] }) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <THead>
            <tr>
              <TH className="w-20">
                <span className="sr-only">Photo</span>
              </TH>
              <TH>Registered name</TH>
              <TH>WHMA No.</TH>
              <TH>Breed</TH>
              <TH>Sex</TH>
              <TH className="hidden xl:table-cell">Coat</TH>
              <TH>Owner</TH>
              <TH className="text-right">Registered</TH>
            </tr>
          </THead>
          <TBody>
            {horses.map((h) => {
              const date = registeredOn(h);
              return (
                <TR key={h.id}>
                  <TD className="py-2">
                    <HorseThumb
                      photos={h.horse_photos}
                      sizes="64px"
                      className="w-16"
                    />
                  </TD>
                  <TD>
                    <Link
                      href={horseHref(h)}
                      className="text-ink underline-offset-4 hover:text-rust hover:underline"
                    >
                      {h.registered_name}
                    </Link>
                    {h.barn_name && (
                      <span className="block text-sm text-dust italic">
                        {h.barn_name}
                      </span>
                    )}
                  </TD>
                  <TD className="font-mono text-sm whitespace-nowrap">
                    <HorseNumber horse={h} />
                  </TD>
                  <TD>{h.breed?.name}</TD>
                  <TD>{sexLabel(h.sex)}</TD>
                  <TD className="hidden text-saddle xl:table-cell">
                    {h.phenotype}
                  </TD>
                  <TD>{ownerName(h)}</TD>
                  <TD className="text-right text-sm whitespace-nowrap text-dust">
                    {date && formatDate(date)}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>

      <ul className="border-t border-bark md:hidden">
        {horses.map((h) => {
          const date = registeredOn(h);
          return (
            <li key={h.id} className="flex gap-4 border-b border-rule py-4">
              <HorseThumb
                photos={h.horse_photos}
                sizes="80px"
                className="w-20"
              />
              <div className="min-w-0">
                <Link href={horseHref(h)} className="text-ink">
                  {h.registered_name}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-saddle">
                  <HorseNumber horse={h} />
                </p>
                <p className="mt-1 text-sm text-dust">
                  {[h.breed?.name, sexLabel(h.sex), h.phenotype]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="text-sm text-dust">
                  {[ownerName(h), date && formatDate(date)]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
