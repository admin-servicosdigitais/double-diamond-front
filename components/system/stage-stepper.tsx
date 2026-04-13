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
    <ol className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.id} className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("font-semibold", step.active && "text-foreground")}>Etapa {index + 1}</span>
            {index < steps.length - 1 && <span className="opacity-50">→</span>}
          </div>
          <p className="mb-2 text-sm font-medium">{step.label}</p>
          <StatusPill status={step.status} />
        </li>
      ))}
    </ol>
  );
}
