import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed bg-muted/30 px-6 py-12 text-center", className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background/90">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sem resultados</p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
