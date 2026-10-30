"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-container flex flex-col items-start py-24">
      <p className="label-caps text-rust">Something went wrong</p>
      <h1 className="mt-3 text-3xl">This page could not be loaded</h1>
      <p className="mt-4 max-w-lg text-lg text-saddle">
        Please try again. If it keeps happening, let the registration team know
        on Discord.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
