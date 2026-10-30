import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-start py-24">
      <p className="label-caps text-rust">Error 404</p>
      <h1 className="mt-2 heading-caps text-3xl text-ink">No record found</h1>
      <p className="mt-4 max-w-lg text-lg text-saddle">
        This page is not in the registry. The link may be wrong, or the horse
        may still be awaiting review by the registration board.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/registry">Browse the registry</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
