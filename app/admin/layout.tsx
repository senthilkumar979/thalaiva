import type { ReactNode } from "react";
import { AdminBreadcrumbNav } from "@/components/admin/AdminBreadcrumbNav";
import { AdminIplShell } from "@/components/admin/AdminIplShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-10xl">
      <AdminIplShell>
        <div className="border-b border-white/10 pb-6">
          <AdminBreadcrumbNav />
        </div>
        <div>{children}</div>
      </AdminIplShell>
    </div>
  );
}
