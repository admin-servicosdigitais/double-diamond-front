"use client";

import { AlertTriangle } from "lucide-react";

import type { Stage } from "@/types/api/domain";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { StatusPill } from "./status-pill";

type WorkflowJourneyStepperProps = {
  stages: Stage[];
  selectedStage: number;
  onSelectStage: (stage: number) => void;
};

export function WorkflowJourneyStepper({ stages, selectedStage, onSelectStage }: WorkflowJourneyStepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stages.map((stage) => {
        const isActive = selectedStage === stage.stage;

        return (
          <li key={stage.stage}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onSelectStage(stage.stage)}
              className={cn(
                "h-auto w-full flex-col items-start gap-2 rounded-xl border bg-card/95 px-3 py-3 text-left shadow-sm",
                isActive && "border-primary/40 ring-2 ring-primary/20",
                stage.status === "blocked" && "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30",
              )}
            >
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <span className={cn("font-semibold", isActive && "text-foreground")}>Estágio {stage.stage}</span>
                {stage.optional ? (
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    Opcional
                  </span>
                ) : null}
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-foreground">{stage.name ?? `Etapa ${stage.stage}`}</p>
              <div className="flex w-full items-center justify-between gap-2">
                <StatusPill status={stage.status} showIcon={false} className="text-[11px]" />
                {stage.status === "blocked" ? <AlertTriangle className="h-4 w-4 text-orange-600" /> : null}
              </div>
            </Button>
          </li>
        );
      })}
    </ol>
  );
}
