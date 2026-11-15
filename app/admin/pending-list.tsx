import Link from "next/link";

import { HorseThumb } from "@/components/registry/horse-thumb";
import { formatDate } from "@/lib/format";
import type { PendingHorse } from "@/lib/admin";
import { sexLabel } from "@/lib/horses";

/** Submissions waiting for review, each linking to its review page. */
export function PendingList({ horses }: { horses: PendingHorse[] }) {
  return (
    <ul className="border-t border-bark">
      {horses.map((h) => (
        <li key={h.id}>
          <Link
            href={`/admin/review/${h.id}`}
            className="flex items-center gap-4 border-b border-rule py-3 hover:bg-card"
          >
            <HorseThumb photos={h.horse_photos} sizes="80px" className="w-20" />
            <div className="min-w-0 flex-1">
              <p className="text-ink">{h.registered_name}</p>
              <p className="text-sm text-dust">
                {[h.breed?.name, sexLabel(h.sex)].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm text-saddle">
                {h.owner?.display_name}
                {h.owner?.discord_username && (
                  <span className="text-dust">
                    {" "}
                    · {h.owner.discord_username}
                  </span>
                )}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="label-caps text-dust">Submitted</p>
              <p className="text-sm text-saddle">
                {h.submitted_at && formatDate(h.submitted_at)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
