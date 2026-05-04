"use client";

import { Check } from "lucide-react";

import { statusConfig } from "@/components/system/status-config";
import { cn } from "@/lib/utils";
import type { Stage } from "@/types/api/domain";

type Props = {
  stages: Stage[];
  selectedStageKey: string;
  onSelectStage: (stageKey: string) => void;
};

function isStageComplete(status: Stage["status"]) {
  return status === "completed" || status === "approved";
}

export function WorkflowStageTimeline({ stages, selectedStageKey, onSelectStage }: Props) {
  return (
    <ol className="relative space-y-1">
      {stages.map((stage, index) => {
        const config = statusConfig[stage.status];
        const Icon = config.icon;
        const isSelected = stage.stageKey === selectedStageKey;
        const isLast = index === stages.length - 1;
        const complete = isStageComplete(stage.status);

        return (
          <li key={stage.stageKey} className="relative">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[18px] top-9 h-[calc(100%-12px)] w-px",
                  complete ? "bg-emerald-300" : "bg-border",
                )}
              />
            ) : null}

            <button
              type="button"
              onClick={() => onSelectStage(stage.stageKey)}
              className={cn(
                "focus-ring relative flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition",
                isSelected ? "bg-muted/60" : "hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background",
                  complete ? "border-emerald-400 text-emerald-600" : "border-border text-muted-foreground",
                  isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                )}
              >
                {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>

              <span className="min-w-0 flex-1 pt-0.5">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Etapa {stage.stage}
                  </span>
                  {stage.optional ? (
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      opcional
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {stage.name ?? `Estágio ${stage.stage}`}
                </span>
                <span className="block text-xs text-muted-foreground">{config.label}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
