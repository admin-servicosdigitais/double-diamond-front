import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: LucideIcon;
  className?: string;
};

export function MetricCard({ label, value, helper, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("border-border/60 bg-card", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">{label}</CardDescription>
        <CardTitle className="text-3xl leading-none tracking-tight">{value}</CardTitle>
      </CardHeader>
      {(helper || Icon) ? (
        <CardContent className="flex items-center justify-between pt-0">
          {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : <span />}
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
