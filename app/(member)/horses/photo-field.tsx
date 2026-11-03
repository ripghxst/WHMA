"use client";

import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/client/compress-image";
import { cn } from "@/lib/cn";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, PHOTO_TYPES } from "@/lib/horses";

export type PhotoItem =
  | { key: string; kind: "existing"; path: string; url: string }
  | { key: string; kind: "new"; blob: Blob; url: string };

type Props = {
  photos: PhotoItem[];
  primaryKey: string | null;
  onChange: (photos: PhotoItem[], primaryKey: string | null) => void;
  error?: string;
  disabled?: boolean;
};

export function PhotoField({
  photos,
  primaryKey,
  onChange,
  error,
  disabled,
}: Props) {
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const room = MAX_PHOTOS - photos.length;

  async function addFiles(files: FileList | File[]) {
    const list = Array.from(files);
    const issues: string[] = [];
    const added: PhotoItem[] = [];
    setBusy(true);

    for (const file of list) {
      if (added.length >= room) {
        issues.push(`You can add up to ${MAX_PHOTOS} photos.`);
        break;
      }
      if (!PHOTO_TYPES.includes(file.type)) {
        issues.push(`${file.name}: use a JPG, PNG or WebP image.`);
        continue;
      }
      const blob = await compressImage(file);
      if (blob.size > MAX_PHOTO_BYTES) {
        issues.push(`${file.name}: the image is larger than 5 MB.`);
        continue;
      }
      added.push({
        key: crypto.randomUUID(),
        kind: "new",
        blob,
        url: URL.createObjectURL(blob),
      });
    }

    setBusy(false);
    setProblems(issues);
    if (added.length) {
      const next = [...photos, ...added];
      onChange(next, primaryKey ?? next[0].key);
    }
  }

  function remove(key: string) {
    const next = photos.filter((p) => p.key !== key);
    const removed = photos.find((p) => p.key === key);
    if (removed?.kind === "new") URL.revokeObjectURL(removed.url);
    onChange(next, primaryKey === key ? (next[0]?.key ?? null) : primaryKey);
  }

  function move(index: number, by: -1 | 1) {
    const next = [...photos];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onChange(next, primaryKey);
  }

  const errorId = error || problems.length ? `${uid}-error` : undefined;

  return (
    <div aria-describedby={errorId}>
      {photos.length > 0 && (
        <ol className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {photos.map((photo, i) => {
            const isPrimary = photo.key === primaryKey;
            return (
              <li
                key={photo.key}
                className={cn(
                  "overflow-hidden rounded-xs border bg-card",
                  isPrimary ? "border-rust" : "border-rule",
                )}
              >
                <div className="relative aspect-[4/3] bg-paper-deep">
                  {/* Local previews and storage URLs; next/image adds nothing here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {isPrimary && (
                    <span className="absolute top-2 left-2 rounded-xs bg-rust px-2 py-0.5 label-caps text-white">
                      Main photo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 p-2">
                  {!isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2"
                      disabled={disabled}
                      onClick={() => onChange(photos, photo.key)}
                    >
                      Make main
                    </Button>
                  )}
                  <span className="flex-1" />
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} earlier`}
                    disabled={disabled || i === 0}
                    onClick={() => move(i, -1)}
                    className="h-8 w-8 text-saddle hover:text-ink disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label={`Move photo ${i + 1} later`}
                    disabled={disabled || i === photos.length - 1}
                    onClick={() => move(i, 1)}
                    className="h-8 w-8 text-saddle hover:text-ink disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    disabled={disabled}
                    onClick={() => remove(photo.key)}
                    className="h-8 px-2 label-caps text-rejected hover:underline disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {room > 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) void addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-xs border border-dashed px-6 py-8 text-center transition-colors",
            dragging ? "border-rust bg-card" : "border-taupe",
          )}
        >
          <p className="text-saddle">
            {busy
              ? "Preparing photos…"
              : "Drag screenshots here, or choose them from your computer."}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || busy}
            onClick={() => input.current?.click()}
          >
            Choose photos
          </Button>
          <p className="text-xs text-dust">
            JPG, PNG or WebP · up to {MAX_PHOTOS} photos ·{" "}
            {photos.length > 0 ? `${room} more allowed` : "5 MB each"}
          </p>
          <input
            ref={input}
            type="file"
            accept={PHOTO_TYPES.join(",")}
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {(error || problems.length > 0) && (
        <div id={errorId} className="mt-3 text-sm text-rejected">
          {error && <p>{error}</p>}
          {problems.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
