import type { StageStatus } from "@/types/api/domain";

import { cn } from "@/lib/utils";

import { StatusPill } from "./status-pill";

type StepItem = {
  id: string;
  label: string;
  status: StageStatus;
  active?: boolean;
};

export function StageStepper({ steps }: { steps: StepItem[] }) {
  return (
    <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={cn(
            "rounded-xl border bg-card/95 p-3 shadow-sm transition",
            step.active && "border-primary/40 ring-2 ring-primary/15",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className={cn("font-semibold", step.active && "text-foreground")}>Etapa {index + 1}</span>
            <span className="text-[11px]">{step.active ? "Atual" : ""}</span>
          </div>
          <p className="mb-3 line-clamp-2 text-sm font-semibold">{step.label}</p>
          <StatusPill status={step.status} />
        </li>
      ))}
    </ol>
  );
}
