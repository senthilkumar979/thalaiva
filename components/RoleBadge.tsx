"use client";

import { RoleIcon } from "@/components/RoleIcon";
import { cn } from "@/lib/utils";
import { playerRoleLabel, playerRoleShort } from "@/lib/playerRoleLabel";
import { roleBadgeClass } from "@/lib/roleStyles";

interface RoleBadgeProps {
  role: string;
  tone?: "enter" | "default";
  variant?: "short" | "full";
  className?: string;
  /** Show IPL role icon (default true). */
  showIcon?: boolean;
}

export const RoleBadge = ({
  role,
  tone = "default",
  variant = "full",
  className,
  showIcon = true,
}: RoleBadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold tracking-wide",
      variant === "short" ? "text-[10px] uppercase" : "text-[10px] sm:text-[11px]",
      roleBadgeClass(role, tone),
      className
    )}
  >
    {showIcon && <RoleIcon role={role} size={variant === "short" ? "xs" : "sm"} />}
    {variant === "short" ? playerRoleShort(role) : playerRoleLabel(role)}
  </span>
);
