export function AuthHeading({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h1 className="heading-caps text-3xl text-ink">{title}</h1>
      {children && <p className="mt-2 text-saddle">{children}</p>}
    </div>
  );
}
