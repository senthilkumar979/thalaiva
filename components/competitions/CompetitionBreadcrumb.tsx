"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CompetitionBreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
  className?: string;
}

export const CompetitionBreadcrumb = ({
  items,
  variant = "dark",
  className,
}: CompetitionBreadcrumbProps) => {
  const dark = variant === "dark";
  return (
    <nav aria-label="Breadcrumb" className={cn("relative z-10 text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight
                  className={cn("size-3.5 shrink-0", dark ? "text-white/40" : "text-muted-foreground")}
                  aria-hidden
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  prefetch
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-1.5 font-medium underline-offset-2 transition-colors -my-1",
                    dark
                      ? "text-white/90 hover:bg-white/10 hover:text-white hover:underline"
                      : "text-primary hover:bg-primary/10 hover:underline"
                  )}
                >
                  {item.href === "/" && i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Home className="size-3.5 shrink-0 opacity-90" aria-hidden />
                      Home
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  className={cn(
                    "px-1.5 py-1.5 font-medium",
                    dark ? "text-white/55" : "text-muted-foreground",
                    isLast && dark && "text-white/85",
                    isLast && !dark && "text-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
