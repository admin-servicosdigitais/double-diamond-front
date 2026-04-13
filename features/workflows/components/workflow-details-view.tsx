"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AlertCircle, AlertTriangle, CheckCircle2, History, ListChecks, Play, RotateCcw, SkipForward } from "lucide-react";

import {
  AlertBanner,
  EmptyState,
  StatusPill,
  SystemCard,
  SystemSkeleton,
  WorkflowJourneyStepper,
  systemToast,
} from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { HumanApprovalDialog } from "@/features/workflows/components/human-approval-dialog";
import { useApproveStageMutation, useNextStageMutation, useRunStageMutation, useStageOutputsQuery, useWorkflowQuery } from "@/hooks/api/use-domain-api";
import { formatWorkflowDate } from "@/lib/workflow/display";
import { WORKFLOW_STAGE_BLUEPRINTS, getStageBlueprint, inferStageSummary, mergeStageWithBlueprint } from "@/lib/workflow/stages";
import { cn } from "@/lib/utils";
import type { Artifact, Stage, StageOutput } from "@/types/api/domain";

function getOperationalMessages(stage: Stage) {
  const messages: Array<{ tone: "warning" | "critical" | "info"; title: string; description: string }> = [];

  if (stage.status === "awaiting_human_approval") {
    messages.push({
      tone: "warning",
      title: "Aguardando aprovação humana",
      description: "Este estágio depende de decisão humana para liberar o avanço para o próximo estágio.",
    });
  }

  if (stage.status === "blocked") {
    messages.push({
      tone: "critical",
      title: "Bloqueio operacional detectado",
      description: "Há dependências pendentes. Resolva o impedimento antes de continuar a jornada.",
    });
  }

  if (stage.status === "error") {
    messages.push({
      tone: "critical",
      title: "Erro na execução",
      description: "Falha identificada no estágio. Avalie outputs e considere reexecutar.",
    });
  }

  if (stage.optional) {
    messages.push({
      tone: "info",
      title: "Estágio opcional/condicional",
      description: "O estágio 8 pode ser pulado quando a condição de negócio não exigir tratativas adicionais.",
    });
  }

  if (messages.length === 0) {
    messages.push({
      tone: "info",
      title: "Sem bloqueios ativos",
      description: "Fluxo operacional segue normalmente para o estágio selecionado.",
    });
  }

  return messages;
}

function getOutputsSummary(outputs: StageOutput[] | undefined): Artifact[] {
  if (!outputs?.length) return [];

  return outputs
    .flatMap((output) => output.artifacts ?? [])
    .sort((a, b) => (new Date(b.updatedAt ?? 0).getTime() || 0) - (new Date(a.updatedAt ?? 0).getTime() || 0));
}

export function WorkflowDetailsView({ workflowId }: { workflowId: string }) {
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(1);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [humanReviewed, setHumanReviewed] = useState(false);
  const [justApprovedStage, setJustApprovedStage] = useState<number | null>(null);

  const workflowQuery = useWorkflowQuery(workflowId);
  const runStageMutation = useRunStageMutation();
  const approveStageMutation = useApproveStageMutation();
  const nextStageMutation = useNextStageMutation();

  const workflow = workflowQuery.data;
  const currentStageNumber = workflow?.currentStage ?? 1;

  const stages = useMemo(() => {
    const stageMap = new Map((workflow?.stages ?? []).map((stage) => [stage.stage, stage]));

    return WORKFLOW_STAGE_BLUEPRINTS.map((blueprint) => mergeStageWithBlueprint(blueprint.stage, stageMap.get(blueprint.stage)));
  }, [workflow?.stages]);

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.stage === selectedStageNumber) ?? stages.find((stage) => stage.stage === currentStageNumber),
    [currentStageNumber, selectedStageNumber, stages],
  );

  const effectiveSelectedStage = selectedStage ?? stages[0];
  const stageOutputsQuery = useStageOutputsQuery(workflowId, effectiveSelectedStage?.stage ?? 1);
  const artifacts = getOutputsSummary(stageOutputsQuery.data);

  const stageBlueprint = effectiveSelectedStage ? getStageBlueprint(effectiveSelectedStage.stage) : undefined;
  const stageDescription = stageBlueprint?.description ?? "Sem descrição disponível para este estágio.";
  const stageSummary = effectiveSelectedStage ? inferStageSummary(effectiveSelectedStage.status) : "";

  const canRun = Boolean(effectiveSelectedStage?.canRun ?? effectiveSelectedStage?.status === "not_started");
  const canApprove = Boolean(
    effectiveSelectedStage?.canApprove ??
      effectiveSelectedStage?.status === "awaiting_human_approval" ||
      effectiveSelectedStage?.status === "running",
  );
  const nextBlockedByApproval =
    effectiveSelectedStage?.status !== "approved" && justApprovedStage !== effectiveSelectedStage?.stage;
  const shouldShowApproveAction = Boolean(
    canApprove &&
      (effectiveSelectedStage?.status === "awaiting_human_approval" ||
        effectiveSelectedStage?.requiresApproval ||
        effectiveSelectedStage?.stage === 7 ||
        effectiveSelectedStage?.status === "running"),
  );

  const isMutating = runStageMutation.isPending || approveStageMutation.isPending || nextStageMutation.isPending;

  const runStage = async () => {
    if (!effectiveSelectedStage) return;
    try {
      await runStageMutation.mutateAsync({ workflowId, stage: effectiveSelectedStage.stage });
      systemToast.success("Estágio em execução", `Estágio ${effectiveSelectedStage.stage} iniciado com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível iniciar o estágio agora.";
      systemToast.error("Erro ao executar", message);
    }
  };

  const approveStage = async () => {
    if (!effectiveSelectedStage) return;
    try {
      await approveStageMutation.mutateAsync({ workflowId, stage: effectiveSelectedStage.stage });
      setJustApprovedStage(effectiveSelectedStage.stage);
      setApprovalOpen(false);
      setHumanReviewed(false);
      setApprovalNotes("");
      systemToast.success("Estágio aprovado", `Estágio ${effectiveSelectedStage.stage} aprovado.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível registrar a aprovação agora.";
      systemToast.error("Erro ao aprovar", message);
    }
  };

  const nextStage = async () => {
    if (!effectiveSelectedStage) return;
    if (nextBlockedByApproval) {
      systemToast.warning("Ação bloqueada", "A ação de avançar só fica disponível após aprovação humana do estágio.");
      return;
    }

    try {
      await nextStageMutation.mutateAsync({
        workflowId,
        stage: effectiveSelectedStage.stage,
        currentStage: effectiveSelectedStage,
      });

      systemToast.success("Workflow avançado", "Próximo estágio liberado com sucesso.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível avançar o workflow agora.";
      systemToast.error("Erro ao avançar", message);
    }
  };

  if (workflowQuery.isLoading) {
    return (
      <div className="space-y-4">
        <SystemSkeleton className="h-20 w-full rounded-xl" />
        <SystemSkeleton className="h-36 w-full rounded-xl" />
        <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
          <SystemSkeleton className="h-80 w-full rounded-xl" />
          <SystemSkeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (workflowQuery.isError || !workflow) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Não foi possível carregar o workflow"
        description="Falha ao buscar dados do workflow. Tente novamente para restaurar a visão central da jornada."
        actionLabel="Tentar novamente"
        onAction={() => workflowQuery.refetch()}
      />
    );
  }

  if (!effectiveSelectedStage) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Nenhum estágio disponível"
        description="Esse workflow ainda não possui estágios configurados pela API."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Workflow</p>
            <h1 className="text-2xl font-semibold">{workflow.name}</h1>
            <p className="text-sm text-muted-foreground">ID: {workflow.id}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={workflow.status} />
            <Button variant="outline" size="sm" onClick={runStage} disabled={!canRun || isMutating} className="gap-2">
              <Play className="h-4 w-4" />
              Executar estágio
            </Button>
            <Link
              href={`/workflows/${workflow.id}/stages/${effectiveSelectedStage.stage}/outputs`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Revisar outputs
            </Link>
          </div>
        </div>
      </section>

      <SystemCard
        title="Mapa da jornada por estágios"
        description="Clique no estágio para abrir detalhes. O estágio 8 é opcional/condicional quando o cenário não demandar tratativas extras."
      >
        <WorkflowJourneyStepper
          stages={stages}
          selectedStage={effectiveSelectedStage.stage}
          onSelectStage={setSelectedStageNumber}
        />
      </SystemCard>

      {effectiveSelectedStage.status === "blocked" ? (
        <AlertBanner
          tone="critical"
          title="Bloqueio forte detectado"
          description="Este estágio está bloqueado. Resolva as dependências para habilitar execução, aprovação e avanço."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <SystemCard title="Contexto principal" description="Visão resumida para decisão rápida no estágio atual.">
            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">
                  Estágio {effectiveSelectedStage.stage}: {effectiveSelectedStage.name}
                </h2>
                {effectiveSelectedStage.optional ? <Badge variant="secondary">Opcional/condicional</Badge> : null}
              </div>
              <p className="text-muted-foreground">{stageDescription}</p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={effectiveSelectedStage.status} />
                <Badge variant="outline">Resumo: {stageSummary}</Badge>
                {effectiveSelectedStage.status === "approved" || justApprovedStage === effectiveSelectedStage.stage ? (
                  <Badge className="border-emerald-800 bg-emerald-600 text-white">APPROVED</Badge>
                ) : null}
              </div>
              <p className="flex items-center gap-2 text-muted-foreground">
                <History className="h-4 w-4" />
                Última atualização: {formatWorkflowDate(workflow.updatedAt ?? workflow.createdAt)}
              </p>
            </div>
          </SystemCard>

          <SystemCard title="Outputs recentes" description="Últimos artefatos associados ao estágio selecionado.">
            {stageOutputsQuery.isLoading ? (
              <div className="space-y-2">
                <SystemSkeleton className="h-16 w-full" />
                <SystemSkeleton className="h-16 w-full" />
              </div>
            ) : stageOutputsQuery.isError ? (
              <AlertBanner
                tone="warning"
                title="Falha ao carregar outputs"
                description="Não foi possível carregar os artefatos deste estágio agora."
              />
            ) : artifacts.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="Nenhum artefato recente"
                description="Execute o estágio para gerar outputs e acompanhar os artefatos aqui."
              />
            ) : (
              <ul className="space-y-2">
                {artifacts.slice(0, 5).map((artifact) => (
                  <li key={`${artifact.name}-${artifact.updatedAt}`} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{artifact.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {artifact.mimeType ?? "Tipo não informado"} • Atualizado em {formatWorkflowDate(artifact.updatedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SystemCard>

          <SystemCard title="Observações operacionais" description="Bloqueios, alertas e dependências para manter o fluxo saudável.">
            <div className="space-y-2">
              {getOperationalMessages(effectiveSelectedStage).map((item) => (
                <AlertBanner key={item.title} tone={item.tone} title={item.title} description={item.description} />
              ))}
            </div>
          </SystemCard>
        </div>

        <SystemCard title="Próxima ação" description="Escolha a ação mais segura para avançar o workflow.">
          <div className="space-y-2">
            <Button className="w-full justify-start gap-2" onClick={runStage} disabled={!canRun || isMutating}>
              <Play className="h-4 w-4" />
              Executar estágio
            </Button>

            <Link
              href={`/workflows/${workflow.id}/stages/${effectiveSelectedStage.stage}/outputs`}
              className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start")}
            >
              Revisar outputs
            </Link>

            {shouldShowApproveAction ? (
              <Button className="w-full justify-start gap-2" variant="secondary" onClick={() => setApprovalOpen(true)} disabled={isMutating}>
                <CheckCircle2 className="h-4 w-4" />
                Aprovar estágio
              </Button>
            ) : null}

            <Button className="w-full justify-start gap-2" variant="default" onClick={nextStage} disabled={nextBlockedByApproval || isMutating}>
              <SkipForward className="h-4 w-4" />
              Avançar para próximo
            </Button>

            <Button
              className="w-full justify-start gap-2"
              variant="ghost"
              onClick={runStage}
              disabled={effectiveSelectedStage.status !== "error" && effectiveSelectedStage.status !== "blocked"}
            >
              <RotateCcw className="h-4 w-4" />
              Reexecutar se necessário
            </Button>

            {nextBlockedByApproval ? (
              <p className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                O avanço só é permitido após aprovação humana explícita deste estágio.
              </p>
            ) : null}

            {effectiveSelectedStage.status === "approved" || justApprovedStage === effectiveSelectedStage.stage ? (
              <p className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-2 text-xs font-semibold text-emerald-900">
                Aprovação registrada com sucesso. O próximo passo já está disponível.
              </p>
            ) : null}
          </div>
        </SystemCard>
      </div>

      <HumanApprovalDialog
        open={approvalOpen}
        stageNumber={effectiveSelectedStage.stage}
        stageName={effectiveSelectedStage.name}
        stageStatusLabel={effectiveSelectedStage.status}
        stageSummary={stageSummary}
        outputs={artifacts}
        notes={approvalNotes}
        onNotesChange={setApprovalNotes}
        reviewed={humanReviewed}
        onReviewedChange={setHumanReviewed}
        onClose={() => {
          setApprovalOpen(false);
          setHumanReviewed(false);
        }}
        onConfirm={approveStage}
        isSubmitting={isMutating}
      />
    </div>
  );
}
