import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminBackLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const AdminBackLink = ({ href, children, className }: AdminBackLinkProps) => (
  <Link
    href={href}
    className={cn(
      "inline-flex text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
      className
    )}
  >
    {children}
  </Link>
);
