import { cn } from "@/lib/utils";
import type { StageStatus } from "@/types/api/domain";

import { statusConfig } from "./status-config";

type StatusPillProps = {
  status: StageStatus;
  showIcon?: boolean;
  className?: string;
};

export function StatusPill({ status, showIcon = true, className }: StatusPillProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.tone,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} aria-hidden />
      {showIcon && <Icon className={cn("h-3.5 w-3.5", status === "running" && "animate-spin")} />}
      {config.label}
    </span>
  );
}
