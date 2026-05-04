"use client";

import { Loader2, Play, RotateCcw, Sparkles, TriangleAlert } from "lucide-react";

import { systemToast } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRunStageMutation, useStageOutputsQuery } from "@/hooks/api/use-domain-queries";
import { useQualityGateFlow } from "@/hooks/use-quality-gate-flow";
import { getStageBlueprint, inferStageSummary } from "@/lib/workflow/stages";
import { getErrorMessage } from "@/services/api/client";
import type { Stage } from "@/types/api/domain";
import { canRunStage } from "@/utils/workflow/status";

import { InlineApprovalCard } from "./inline-approval-card";
import { QualityGatePanel } from "./quality-gate-panel";
import { StageAuditCollapsible } from "./stage-audit-collapsible";
import { StageOutputsList } from "./stage-outputs-list";

type Props = {
  workflowId: string;
  stage: Stage;
  transientError?: string;
  onAdvance?: (
    nextStageKey?: string,
    autoRun?: { failed: true; message?: string } | null,
  ) => void;
  onClearTransientError?: () => void;
};

const OUTPUT_STATUSES: Stage["status"][] = [
  "running",
  "awaiting_human_approval",
  "approved",
  "completed",
  "error",
];

const REFINABLE_STATUSES: Stage["status"][] = ["awaiting_human_approval", "approved", "completed"];

function getPrimaryActionLabel(stage: Stage) {
  if (stage.status === "running") return "Em execução…";
  if (stage.status === "completed" || stage.status === "approved") return "Reexecutar";
  return "Executar estágio";
}

export function StageWorkPanel({ workflowId, stage, transientError, onAdvance, onClearTransientError }: Props) {
  const runMutation = useRunStageMutation();
  const stageHasOutputs = OUTPUT_STATUSES.includes(stage.status);
  const outputsQuery = useStageOutputsQuery(workflowId, stage.stageKey, {
    enabled: stageHasOutputs,
  });

  const qualityGate = useQualityGateFlow({
    workflowId,
    stage,
    initialGate: stage.qualityGate?.status === "pending" ? stage.qualityGate : undefined,
  });

  const blueprint = getStageBlueprint(stage.stage);
  const description = blueprint?.description ?? "Sem descrição disponível para este estágio.";
  const summary = inferStageSummary(stage.status);
  const isAwaitingApproval = stage.status === "awaiting_human_approval";
  const isErrored = stage.status === "error";
  const showRetryBlock = isErrored || Boolean(transientError);
  const canRun = canRunStage(stage) || stage.status === "completed" || stage.status === "approved";
  const canRefine =
    REFINABLE_STATUSES.includes(stage.status) &&
    !outputsQuery.isLoading &&
    !outputsQuery.isError &&
    (outputsQuery.data?.length ?? 0) > 0;

  async function handleRun() {
    try {
      const response = await runMutation.mutateAsync({ workflowId, stage: stage.stageKey });
      if (response?.status === "error") {
        systemToast.error(
          "O estágio voltou em erro",
          response.message ?? "Verifique logs do backend e tente reexecutar em instantes.",
        );
        return;
      }
      onClearTransientError?.();
      systemToast.success("Estágio em execução", `Estágio ${stage.stage} iniciado.`);
    } catch (error) {
      systemToast.error("Erro ao executar", getErrorMessage(error) ?? "Não foi possível iniciar o estágio.");
    }
  }

  async function handleStartQualityGate() {
    try {
      await qualityGate.start();
    } catch (error) {
      systemToast.error("Erro ao iniciar quality gate", getErrorMessage(error) ?? "Tente novamente em instantes.");
    }
  }

  const primaryActionIcon =
    stage.status === "running" ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : stage.status === "completed" || stage.status === "approved" ? (
      <RotateCcw className="h-4 w-4" />
    ) : (
      <Play className="h-4 w-4" />
    );

  const retryDescription =
    transientError ??
    "A execução automática deste estágio falhou. Reexecute para continuar — seu progresso anterior está preservado.";

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Etapa {stage.stage}
            {stage.optional ? <span className="ml-2 text-[10px] uppercase">opcional</span> : null}
          </p>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{stage.name ?? `Estágio ${stage.stage}`}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>

        {!showRetryBlock && !isAwaitingApproval ? (
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
              {summary}
            </Badge>
            <Button
              type="button"
              onClick={handleRun}
              disabled={!canRun || runMutation.isPending}
              className="h-11 min-w-[200px] gap-2 text-sm font-semibold"
            >
              {runMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : primaryActionIcon}
              {getPrimaryActionLabel(stage)}
            </Button>
          </div>
        ) : null}
      </header>

      {showRetryBlock ? (
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-rose-900">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Estágio precisa ser reexecutado</p>
              <p className="text-xs leading-relaxed opacity-90">{retryDescription}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleRun}
            disabled={runMutation.isPending}
            variant="destructive"
            className="h-11 min-w-[200px] gap-2 text-sm font-semibold"
          >
            {runMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Reexecutar agora
          </Button>
        </section>
      ) : null}

      {isAwaitingApproval ? (
        <InlineApprovalCard
          workflowId={workflowId}
          stage={stage}
          outputs={outputsQuery.data}
          summary={summary}
          onApproved={onAdvance}
        />
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Outputs do estágio</h3>
          {canRefine && !qualityGate.open ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleStartQualityGate}
              disabled={qualityGate.isGenerating}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {qualityGate.isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Refinar com Quality Gate
            </Button>
          ) : null}
        </div>
        <StageOutputsList
          outputs={outputsQuery.data}
          isLoading={stageHasOutputs && outputsQuery.isLoading}
          isError={stageHasOutputs && outputsQuery.isError}
          onRetry={() => outputsQuery.refetch()}
          emptyHint={
            stage.status === "running"
              ? "Execução em andamento. Os artefatos aparecerão aqui em instantes."
              : stage.status === "error"
                ? "Sem artefatos por causa da falha. Reexecute para gerá-los."
                : stage.status === "not_started"
                  ? "Estágio ainda não executado. Clique em Executar para gerar os primeiros artefatos."
                  : "Sem artefatos para este estágio."
          }
        />
      </div>

      {qualityGate.open ? (
        <QualityGatePanel
          gate={qualityGate.gate}
          isGenerating={qualityGate.isGenerating}
          isAnswering={qualityGate.isAnswering}
          isSkipping={qualityGate.isSkipping}
          onSubmit={qualityGate.submitAnswers}
          onSkip={qualityGate.dismiss}
          onClose={qualityGate.closeWithoutDismiss}
        />
      ) : null}

      <StageAuditCollapsible stage={stage} />
    </section>
  );
}
