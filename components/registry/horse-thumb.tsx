import Image from "next/image";

import { cn } from "@/lib/cn";
import { photoUrl, primaryPhoto } from "@/lib/horses";

type Photo = { storage_path: string; is_primary: boolean; sort_order: number };

/** 4:3 thumbnail of a horse's main photo, or a quiet placeholder. */
export function HorseThumb({
  photos,
  sizes,
  className,
}: {
  photos: Photo[];
  sizes: string;
  className?: string;
}) {
  const photo = primaryPhoto(photos);
  return (
    <div
      className={cn(
        "relative aspect-[4/3] shrink-0 overflow-hidden rounded-xs bg-paper-deep",
        className,
      )}
    >
      {photo && (
        <Image
          src={photoUrl(photo.storage_path)}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}
