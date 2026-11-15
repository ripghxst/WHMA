/** One row of a horse's registration record (a <dt>/<dd> pair inside a <dl>). */
export function RecordDetail({
  label,
  mono,
  children,
}: {
  label: string;
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-b border-rule py-2.5 last:border-b-0">
      <dt className="pt-0.5 label-caps text-saddle">{label}</dt>
      <dd className={mono ? "font-mono text-sm text-ink" : "text-ink"}>
        {children || <span className="text-dust">Not recorded</span>}
      </dd>
    </div>
  );
}
