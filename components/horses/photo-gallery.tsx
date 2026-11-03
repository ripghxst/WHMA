"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { cn } from "@/lib/cn";

type Photo = { url: string };

/** Main photo with thumbnails; clicking the photo opens it full size. */
export function PhotoGallery({
  photos,
  name,
}: {
  photos: Photo[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const current = photos[index];
  const several = photos.length > 1;
  const step = (by: number) =>
    setIndex((i) => (i + by + photos.length) % photos.length);

  return (
    <div>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`View ${name} full size`}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xs bg-ink"
      >
        <Image
          src={current.url}
          alt={`${name}, photo ${index + 1} of ${photos.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
      </button>

      {several && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {photos.map((photo, i) => (
            <li key={photo.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-xs border-2 bg-paper-deep",
                  i === index
                    ? "border-rust"
                    : "border-transparent hover:border-taupe",
                )}
              >
                <Image
                  src={photo.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialog}
        aria-label={`${name}, full size photo`}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (several && e.key === "ArrowLeft") step(-1);
          if (several && e.key === "ArrowRight") step(1);
        }}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90"
      >
        <div className="relative h-[85vh] w-[92vw]">
          <Image
            src={current.url}
            alt={`${name}, photo ${index + 1} of ${photos.length}`}
            fill
            sizes="92vw"
            className="object-contain"
          />
        </div>
        <div className="flex items-center justify-center gap-6 pt-3 label-caps text-paper">
          {several && (
            <button
              type="button"
              onClick={() => step(-1)}
              className="hover:text-taupe"
            >
              Previous
            </button>
          )}
          {several && (
            <span className="font-mono font-normal tracking-normal">
              {index + 1} / {photos.length}
            </span>
          )}
          {several && (
            <button
              type="button"
              onClick={() => step(1)}
              className="hover:text-taupe"
            >
              Next
            </button>
          )}
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="hover:text-taupe"
          >
            Close
          </button>
        </div>
      </dialog>
    </div>
  );
}
