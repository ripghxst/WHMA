/**
 * Suspense fallback for page content. Reserves a screen of height so the
 * footer doesn't jump when the content streams in (keeps layout shift at 0).
 */
export function PageLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <p role="status" className="min-h-svh py-12 text-dust italic">
      {label}
    </p>
  );
}
