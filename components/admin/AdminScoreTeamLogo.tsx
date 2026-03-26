import { cn } from "@/lib/utils";

interface AdminScoreTeamLogoProps {
  logoUrl?: string;
  shortCode: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeCls = {
  sm: "size-7 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
} as const;

export const AdminScoreTeamLogo = ({
  logoUrl,
  shortCode,
  className,
  size = "md",
}: AdminScoreTeamLogoProps) => {
  const initials = shortCode.slice(0, 2).toUpperCase();
  if (logoUrl?.trim()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- franchise logos from DB; URLs not in next/image config
      <img
        src={logoUrl}
        alt=""
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-border bg-muted",
          sizeCls[size],
          className
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary ring-1 ring-primary/25",
        sizeCls[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
