import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type BannerTone = "info" | "warning" | "success" | "critical";

const toneStyles: Record<BannerTone, { container: string; icon: React.ElementType }> = {
  info: { container: "border-blue-200 bg-blue-50 text-blue-900", icon: Info },
  warning: { container: "border-amber-200 bg-amber-50 text-amber-900", icon: AlertTriangle },
  success: { container: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: CheckCircle2 },
  critical: { container: "border-rose-200 bg-rose-50 text-rose-900", icon: ShieldAlert },
};

type AlertBannerProps = {
  title: string;
  description: string;
  tone?: BannerTone;
  className?: string;
};

export function AlertBanner({ title, description, tone = "info", className }: AlertBannerProps) {
  const style = toneStyles[tone];
  const Icon = style.icon;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3", style.container, className)} role="status">
      <Icon className="mt-0.5 h-4 w-4" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm opacity-85">{description}</p>
      </div>
    </div>
  );
}
