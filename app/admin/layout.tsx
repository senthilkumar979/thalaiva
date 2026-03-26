import type { ReactNode } from 'react'
import { AdminBreadcrumbNav } from '@/components/admin/AdminBreadcrumbNav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-10xl">
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-border/40">
        <header className="border-b border-border/80 bg-muted/35 px-4 py-4 sm:px-6">
          <AdminBreadcrumbNav />
        </header>
        <div className="px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </div>
    </div>
  )
}
