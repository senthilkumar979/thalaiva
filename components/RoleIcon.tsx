"use client";

import { cn } from "@/lib/utils";
import { getIplRoleIconUrl } from "@/lib/iplRoleIcons";

const SIZES = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
} as const;

interface RoleIconProps {
  role: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export const RoleIcon = ({ role, size = "sm", className }: RoleIconProps) => {
  const src = getIplRoleIconUrl(role);
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote IPL SVGs; avoids remotePatterns setup
    <img
      src={src}
      alt=""
      className={cn("shrink-0 object-contain", SIZES[size], className)}
      aria-hidden
    />
  );
};
