import { Suspense } from "react";

import { requireAdmin } from "@/lib/auth";

/** Every admin page is checked on the server; non-admins get a 404. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="page-container py-14 text-dust italic">Loading…</div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
