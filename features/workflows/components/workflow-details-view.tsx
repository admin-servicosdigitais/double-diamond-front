"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AlertTriangle, CheckCircle2, History, ListChecks, Play, RotateCcw, SkipForward } from "lucide-react";

import {
  AlertBanner,
  EmptyState,
  PremiumPageSkeleton,
  StatusPill,
  SystemCard,
  SystemSkeleton,
  UXStateCard,
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
      description: "A jornada depende de uma decisão humana explícita. Abra a aprovação para validar evidências e liberar continuidade.",
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
  const stageIndex = stages.findIndex((item) => item.stage === effectiveSelectedStage?.stage);
  const nextStageCandidate = stageIndex >= 0 ? stages[stageIndex + 1] : undefined;
  const hasNextStage = Boolean(nextStageCandidate);
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
    if (!hasNextStage) {
      systemToast.warning("Fim do fluxo", "Não existe próximo estágio para este workflow.");
      return;
    }

    if (nextBlockedByApproval) {
      systemToast.warning("Ação bloqueada", "A ação “Avançar para próximo estágio” é liberada somente após aprovação humana do estágio atual.");
      return;
    }

    try {
      const nextStageResponse = await nextStageMutation.mutateAsync({
        workflowId,
        stage: effectiveSelectedStage.stage,
        currentStage: effectiveSelectedStage,
      });

      const fallbackNextStage = nextStageCandidate?.stage;
      const nextStageFromApi = nextStageResponse.stage > effectiveSelectedStage.stage ? nextStageResponse.stage : fallbackNextStage;
      if (nextStageFromApi) {
        setSelectedStageNumber(nextStageFromApi);
      }

      systemToast.success(
        "Workflow avançado",
        nextStageFromApi
          ? `Fluxo avançado com sucesso. Estágio ${nextStageFromApi} agora está ativo.`
          : "Fluxo avançado com sucesso.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível avançar o workflow agora.";
      systemToast.error("Erro ao avançar", message);
    }
  };

  if (workflowQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (workflowQuery.isError || !workflow) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos abrir este workflow no momento"
        description="Recarregue para recuperar a jornada completa, os bloqueios ativos e as ações disponíveis."
        actionLabel="Reabrir workflow"
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
    <div className="space-y-6">
      <section className="rounded-xl border bg-card/95 p-5 shadow-sm">
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
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "font-medium")}
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
        <UXStateCard
          kind="blocked"
          title="Fluxo temporariamente bloqueado neste estágio"
          description="Regularize as dependências sinalizadas e depois reexecute o estágio para liberar aprovação e avanço."
          actionLabel="Ver dependências"
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
                title="Ainda não há artefatos publicados"
                description="Execute este estágio para gerar evidências e liberar revisão operacional nesta seção."
                actionLabel="Executar estágio"
                onAction={runStage}
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

        <SystemCard title="Próxima ação" description="Priorize a ação principal e mantenha o fluxo com segurança operacional.">
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
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => setApprovalOpen(true)} disabled={isMutating}>
                <CheckCircle2 className="h-4 w-4" />
                Aprovar estágio
              </Button>
            ) : null}

            <Button
              className="w-full justify-start gap-2"
              variant="default"
              onClick={nextStage}
              disabled={nextBlockedByApproval || isMutating || !hasNextStage}
            >
              <SkipForward className="h-4 w-4" />
              Avançar para próximo estágio
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
                Próximo passo bloqueado: conclua a aprovação do estágio atual para liberar o avanço com segurança.
              </p>
            ) : null}

            {!hasNextStage ? (
              <p className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-700">
                <AlertTriangle className="h-4 w-4" />
                Não existe próximo estágio disponível para este workflow.
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
