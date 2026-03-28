"use client";

import { usePathname } from "next/navigation";
import { buildAdminBreadcrumbs } from "@/components/admin/buildAdminBreadcrumbs";
import { CompetitionBreadcrumb } from "@/components/competitions/CompetitionBreadcrumb";

export const AdminBreadcrumbNav = () => {
  const pathname = usePathname();
  const items = buildAdminBreadcrumbs(pathname);
  return <CompetitionBreadcrumb items={items} variant="dark" />;
};
