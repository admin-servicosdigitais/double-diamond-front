"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks } from "lucide-react";

import { EmptyState, PremiumPageSkeleton, StatusPill, UXStateCard } from "@/components/system";
import { useWorkflowQuery } from "@/hooks/api/use-domain-queries";
import { useCockpitStage } from "@/hooks/use-cockpit-stage";
import { WORKFLOW_STAGE_BLUEPRINTS, mergeStageWithBlueprint } from "@/lib/workflow/stages";

import { StageWorkPanel } from "./stage-work-panel";
import { WorkflowStageTimeline } from "./workflow-stage-timeline";

type Props = {
  workflowId: string;
  initialStageKey?: string;
};

type TransientStageError = {
  stageKey: string;
  message: string;
};

export function WorkflowCockpitView({ workflowId, initialStageKey }: Props) {
  const workflowQuery = useWorkflowQuery(workflowId);
  const workflow = workflowQuery.data;

  const stages = useMemo(() => {
    const stageMap = new Map((workflow?.stages ?? []).map((stage) => [stage.stage, stage]));
    return WORKFLOW_STAGE_BLUEPRINTS.map((blueprint) => mergeStageWithBlueprint(blueprint.stage, stageMap.get(blueprint.stage)));
  }, [workflow?.stages]);

  const fallbackStageKey = useMemo(() => {
    if (workflow?.currentStage) {
      const match = stages.find((stage) => stage.stage === workflow.currentStage);
      if (match?.stageKey) return match.stageKey;
    }
    return stages[0]?.stageKey;
  }, [stages, workflow?.currentStage]);

  const { selectedStageKey, setSelectedStage } = useCockpitStage(stages, initialStageKey, fallbackStageKey);
  const activeStage = stages.find((stage) => stage.stageKey === selectedStageKey) ?? stages[0];

  const [transientError, setTransientError] = useState<TransientStageError | null>(null);

  useEffect(() => {
    if (transientError && activeStage && activeStage.stageKey === transientError.stageKey && activeStage.status !== "error") {
      setTransientError(null);
    }
  }, [activeStage, transientError]);

  if (workflowQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (workflowQuery.isError || !workflow) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos abrir este workflow"
        description="Recarregue para recuperar a jornada completa, bloqueios ativos e ações disponíveis."
        actionLabel="Reabrir workflow"
        onAction={() => workflowQuery.refetch()}
      />
    );
  }

  if (!activeStage) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Nenhum estágio disponível"
        description="Esse workflow ainda não possui estágios configurados pela API."
      />
    );
  }

  const transientErrorForActive =
    transientError && transientError.stageKey === activeStage.stageKey ? transientError : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-xl border border-border/60 bg-card/95 p-4 shadow-sm">
          <header className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workflow</p>
            <h2 className="truncate text-base font-semibold text-foreground">{workflow.name}</h2>
            <div className="flex items-center gap-2">
              <StatusPill status={workflow.status} />
              <span className="text-xs text-muted-foreground">ID: {workflow.id}</span>
            </div>
          </header>

          <WorkflowStageTimeline
            stages={stages}
            selectedStageKey={activeStage.stageKey}
            onSelectStage={setSelectedStage}
          />
        </div>
      </aside>

      <main className="min-w-0">
        <StageWorkPanel
          workflowId={workflowId}
          stage={activeStage}
          transientError={transientErrorForActive?.message}
          onClearTransientError={() => setTransientError(null)}
          onAdvance={(nextStageKey, autoRun) => {
            if (nextStageKey && stages.some((stage) => stage.stageKey === nextStageKey)) {
              setSelectedStage(nextStageKey);
              if (autoRun?.failed) {
                setTransientError({
                  stageKey: nextStageKey,
                  message: autoRun.message ?? "Auto-execução falhou. Reexecute para continuar.",
                });
              } else {
                setTransientError(null);
              }
            }
          }}
        />
      </main>
    </div>
  );
}
