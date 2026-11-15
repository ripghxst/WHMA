import { Suspense } from "react";

import { statusCounts } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

import { AdminNav } from "./admin-nav";

/** Every admin page is checked on the server; non-admins get a 404. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const counts = await statusCounts();
  return (
    <>
      <div className="bg-paper-deep">
        <p className="page-container pt-6 label-caps text-rust">
          Registration board
        </p>
        <AdminNav pending={counts.pending} />
      </div>
      {children}
    </>
  );
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
