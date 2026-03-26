"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const SIZES = {
  xs: "size-5 text-[9px]",
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
} as const;

interface FranchiseMarkProps {
  name: string;
  shortCode: string;
  logoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export const FranchiseMark = ({
  name,
  shortCode,
  logoUrl,
  size = "sm",
  className,
}: FranchiseMarkProps) => {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(logoUrl && !failed);
  const initial = (shortCode || name || "?").slice(0, 2).toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 font-bold text-white/90 ring-1 ring-white/15",
        SIZES[size],
        className
      )}
      title={name}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote franchise logos; avoid domain config
        <img
          src={logoUrl!}
          alt=""
          className="size-full object-contain p-0.5"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="select-none">{initial}</span>
      )}
    </span>
  );
};
