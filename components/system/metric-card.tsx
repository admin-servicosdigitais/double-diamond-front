import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  className?: string;
};

export function MetricCard({ label, value, helper, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("border-border/80 bg-card/90", className)}>
      <CardHeader className="pb-3">
        <CardDescription className="text-xs uppercase tracking-[0.08em]">{label}</CardDescription>
        <CardTitle className="text-3xl leading-none">{value}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <p className="text-xs text-muted-foreground">{helper}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
