import Image, { type StaticImageData } from "next/image";

/** Dark photo band with the page title, as on the WHMA website. */
export function PageBanner({
  title,
  image,
  position = "50% 40%",
  children,
}: {
  title: React.ReactNode;
  image: StaticImageData;
  /** CSS object-position, to keep the horses in frame. */
  position?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <Image
        src={image}
        alt=""
        priority
        placeholder="blur"
        sizes="100vw"
        style={{ objectPosition: position }}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
      />
      <div className="page-container pt-16 pb-8">
        <h1 className="heading-caps text-3xl text-paper sm:text-4xl">
          {title}
        </h1>
        {children && (
          <div className="mt-2 max-w-xl text-paper/85">{children}</div>
        )}
      </div>
    </section>
  );
}
