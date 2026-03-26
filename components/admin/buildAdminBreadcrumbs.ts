import type { BreadcrumbItem } from "@/components/competitions/CompetitionBreadcrumb";

export function buildAdminBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
  ];
  const norm = pathname.replace(/\/$/, "") || "/admin";

  if (norm === "/admin") return items;

  if (norm.startsWith("/admin/players")) {
    items.push({ label: "Players" });
    return items;
  }

  if (norm.startsWith("/admin/competitions")) {
    items.push({ label: "Competitions" });
    return items;
  }

  if (/^\/admin\/matches\/[^/]+\/score$/.test(norm)) {
    items.push({ label: "Matches", href: "/admin/matches" });
    items.push({ label: "Score match" });
    return items;
  }

  if (norm.startsWith("/admin/matches")) {
    items.push({ label: "Matches" });
    return items;
  }

  items.push({ label: "Admin" });
  return items;
}
