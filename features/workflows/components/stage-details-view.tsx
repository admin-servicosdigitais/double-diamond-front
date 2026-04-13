"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, Play, RotateCcw, SkipForward } from "lucide-react";

import { AlertBanner, EmptyState, PremiumPageSkeleton, StatusPill, SystemBreadcrumb, SystemCard, SystemSkeleton, UXStateCard, systemToast } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HumanApprovalDialog } from "@/features/workflows/components/human-approval-dialog";
import {
  useApproveStageMutation,
  useNextStageMutation,
  useRunStageMutation,
  useStageOutputsQuery,
  useWorkflowQuery,
} from "@/hooks/api/use-domain-queries";
import { formatWorkflowDate } from "@/lib/workflow/display";
import { WORKFLOW_STAGE_BLUEPRINTS, getStageBlueprint, mergeStageWithBlueprint } from "@/lib/workflow/stages";
import type { Stage } from "@/types/api/domain";

type ConfirmAction = "approve" | "advance" | "rerun" | null;

const expectedStageIO: Record<number, { inputs: string[]; outputs: string[]; notes: string[] }> = {
  1: {
    inputs: ["Objetivo do workflow", "Contexto inicial", "Restrições conhecidas"],
    outputs: ["Diagnóstico inicial", "Riscos mapeados"],
    notes: ["Valide se o objetivo está claro antes de seguir."],
  },
  2: {
    inputs: ["Diagnóstico do stage 1", "Critérios de sucesso", "Limites operacionais"],
    outputs: ["Plano por etapas", "Checklist de execução"],
    notes: ["Plano incompleto aumenta chance de retrabalho."],
  },
  3: {
    inputs: ["Plano aprovado", "Dependências técnicas disponíveis"],
    outputs: ["Artefatos técnicos", "Evidências de execução"],
    notes: ["Registre decisão técnica fora do padrão no resumo."],
  },
  4: {
    inputs: ["Outputs técnicos", "Critérios de qualidade"],
    outputs: ["Relatório de validação", "Pendências encontradas"],
    notes: ["Se houver bloqueio, não avance sem tratar causa-raiz."],
  },
  5: {
    inputs: ["Relatório de validação", "Requisitos de negócio"],
    outputs: ["Parecer técnico", "Decisão de aprovação"],
    notes: ["Formalize a justificativa da aprovação/reprovação."],
  },
  6: {
    inputs: ["Parecer técnico", "Artefatos finais"],
    outputs: ["Pacote de entrega", "Documentação de suporte"],
    notes: ["Confirme versionamento e rastreabilidade dos arquivos."],
  },
  7: {
    inputs: ["Pacote de entrega", "Contexto para decisão humana"],
    outputs: ["Registro de revisão humana", "Aprovação explícita"],
    notes: ["Sem validação humana, o fluxo deve ficar bloqueado."],
  },
  8: {
    inputs: ["Aprovação do stage 7", "Condição de exceção confirmada"],
    outputs: ["Ajustes condicionais", "Evidências da tratativa"],
    notes: ["Etapa opcional: só execute quando condição de exceção existir."],
  },
  9: {
    inputs: ["Todos os estágios aplicáveis concluídos", "Outputs finais"],
    outputs: ["Encerramento do workflow", "Resumo final auditável"],
    notes: ["Conclua apenas com pendências zeradas."],
  },
};

function getStageFromWorkflow(workflowStages: Stage[] | undefined, stageNumber: number) {
  return mergeStageWithBlueprint(stageNumber, workflowStages?.find((item) => item.stage === stageNumber));
}

export function StageDetailsView({ workflowId, stageId }: { workflowId: string; stageId: string }) {
  const stageNumber = Number(stageId);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [humanReviewed, setHumanReviewed] = useState(false);
  const [justApproved, setJustApproved] = useState(false);

  const workflowQuery = useWorkflowQuery(workflowId);
  const runStageMutation = useRunStageMutation();
  const approveStageMutation = useApproveStageMutation();
  const nextStageMutation = useNextStageMutation();

  const workflow = workflowQuery.data;
  const stage = useMemo(() => (workflow ? getStageFromWorkflow(workflow.stages, stageNumber) : undefined), [workflow, stageNumber]);
  const stage7 = useMemo(() => (workflow ? getStageFromWorkflow(workflow.stages, 7) : undefined), [workflow]);
  const hasNextStage = useMemo(() => {
    if (!stage) return false;
    const highestStage = WORKFLOW_STAGE_BLUEPRINTS[WORKFLOW_STAGE_BLUEPRINTS.length - 1]?.stage ?? stage.stage;
    return stage.stage < highestStage;
  }, [stage]);

  const stageOutputsQuery = useStageOutputsQuery(workflowId, Number.isFinite(stageNumber) ? stageNumber : 1);
  const latestOutput = stageOutputsQuery.data?.[0];
  const stageArtifacts = (stageOutputsQuery.data ?? []).flatMap((output) => output.artifacts ?? []);

  const stageBlueprint = stage ? getStageBlueprint(stage.stage) : undefined;
  const io = expectedStageIO[stageNumber] ?? {
    inputs: ["Dados do estágio anterior"],
    outputs: ["Artefatos do estágio"],
    notes: ["Sem observações específicas para este estágio."],
  };

  const stage8DependencyOk = stageNumber !== 8 || stage7?.status === "approved" || stage7?.status === "completed";
  const awaitingHumanApproval = stage?.status === "awaiting_human_approval";

  const canRun = Boolean(stage?.canRun ?? stage?.status === "not_started");
  const canApprove = Boolean(stage?.canApprove ?? (awaitingHumanApproval || stage?.status === "running"));
  const canAdvance = Boolean(stage?.canNext ?? (stage?.status === "approved" || justApproved));
  const shouldShowApproveAction = canApprove && (awaitingHumanApproval || stage?.requiresApproval || stage?.stage === 7 || stage?.status === "running");

  const isMutating = runStageMutation.isPending || approveStageMutation.isPending || nextStageMutation.isPending;

  const safeRunStage = async () => {
    if (!stage) return;
    try {
      await runStageMutation.mutateAsync({ workflowId, stage: stage.stage });
      systemToast.success("Estágio executado", `Estágio ${stage.stage} iniciado com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao executar estágio.";
      systemToast.error("Erro ao executar", message);
    }
  };

  const approveStage = async () => {
    if (!stage) return;
    try {
      await approveStageMutation.mutateAsync({ workflowId, stage: stage.stage });
      setJustApproved(true);
      systemToast.success("Estágio aprovado", `Estágio ${stage.stage} aprovado com sucesso.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível registrar a aprovação agora.";
      systemToast.error("Erro ao aprovar", message);
      return;
    }
    setHumanReviewed(false);
    setApprovalNotes("");
    setConfirmAction(null);
  };

  const advanceStage = async () => {
    if (!stage) return;
    if (!hasNextStage) {
      systemToast.warning("Fim do fluxo", "Não existe próximo estágio para este workflow.");
      return;
    }

    if (!canAdvance) {
      systemToast.warning("Ação bloqueada", "A ação “Avançar para próximo estágio” exige aprovação do estágio atual.");
      return;
    }

    try {
      const nextStageResponse = await nextStageMutation.mutateAsync({ workflowId, stage: stage.stage, currentStage: stage });
      const nextStageNumber = nextStageResponse.stage > stage.stage ? nextStageResponse.stage : stage.stage + 1;
      systemToast.success("Workflow avançado", `Fluxo avançado com sucesso. Estágio ${nextStageNumber} agora está ativo.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao avançar workflow.";
      systemToast.error("Erro ao avançar", message);
    }
  };

  const executeConfirmedAction = async () => {
    if (confirmAction === "rerun") await safeRunStage();
    if (confirmAction === "advance") await advanceStage();
    setConfirmAction(null);
  };

  if (workflowQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (workflowQuery.isError || !workflow) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos carregar o contexto deste estágio"
        description="Recarregue para recuperar histórico, dependências e ações seguras de execução."
        actionLabel="Recarregar estágio"
        onAction={() => workflowQuery.refetch()}
      />
    );
  }

  if (!stage || !Number.isFinite(stageNumber)) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Estágio inválido"
        description="O identificador do estágio é inválido ou inexistente neste workflow."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SystemBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workflows", href: "/workflows" },
          { label: workflow.name, href: `/workflows/${workflow.id}` },
          { label: `Stage ${stage.stage}` },
        ]}
      />

      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Visão do estágio</p>
            <h1 className="text-2xl font-semibold">{stage.name ?? stageBlueprint?.name ?? `Stage ${stage.stage}`}</h1>
            <p className="text-sm text-muted-foreground">{stageBlueprint?.description ?? "Sem descrição de propósito disponível."}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={stage.status} />
            {stage.status === "approved" || justApproved ? <Badge className="border-emerald-800 bg-emerald-600 text-white">APPROVED</Badge> : null}
            {stage.optional ? <Badge variant="secondary">Opcional</Badge> : null}
          </div>
        </div>
      </section>

      {awaitingHumanApproval ? (
        <UXStateCard
          kind="awaiting_human_approval"
          title="Decisão humana pendente para liberar o fluxo"
          description="Revise evidências, registre a decisão e só então avance. Este controle protege qualidade e governança."
          actionLabel="Iniciar aprovação"
          onAction={() => setConfirmAction("approve")}
        />
      ) : null}

      {stageNumber === 8 ? (
        <AlertBanner
          tone={stage8DependencyOk ? "info" : "critical"}
          title={stage8DependencyOk ? "Stage 8 opcional habilitado" : "Stage 8 bloqueado por dependência"}
          description={
            stage8DependencyOk
              ? "Este estágio é opcional e pode ser executado apenas quando houver condição de exceção confirmada."
              : "O Stage 8 depende do Stage 7 aprovado/concluído. Ação sugerida: volte ao Stage 7, conclua a aprovação humana e tente novamente."
          }
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <SystemCard title="Entradas esperadas" description="Checklist mínimo para iniciar com segurança.">
            <ul className="space-y-2 text-sm">
              {io.inputs.map((item) => (
                <li key={item} className="rounded-lg border p-2">• {item}</li>
              ))}
            </ul>
          </SystemCard>

          <SystemCard title="Saídas esperadas" description="Entregáveis que devem ser produzidos neste estágio.">
            <ul className="space-y-2 text-sm">
              {io.outputs.map((item) => (
                <li key={item} className="rounded-lg border p-2">• {item}</li>
              ))}
            </ul>
          </SystemCard>

          <SystemCard title="Histórico da última execução" description="Resumo operacional da execução mais recente.">
            {stageOutputsQuery.isLoading ? (
              <SystemSkeleton className="h-20 w-full" />
            ) : latestOutput ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Resumo:</span> {latestOutput.summary ?? "Sem resumo textual."}
                </p>
                <p className="text-muted-foreground">Última atualização: {formatWorkflowDate(latestOutput.updatedAt ?? latestOutput.createdAt)}</p>
                <p className="text-muted-foreground">Artefatos: {latestOutput.artifacts?.length ?? 0}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Este estágio ainda não possui execução registrada.</p>
            )}
          </SystemCard>

          <SystemCard title="Validações e bloqueios" description="Sinais que impedem execução segura e ação recomendada.">
            <div className="space-y-2">
              {stage.status === "blocked" ? (
                <UXStateCard
                  kind="blocked"
                  title="Este estágio está bloqueado por dependências"
                  description="Revise o estágio anterior, regularize os pré-requisitos e retome a execução para seguir com segurança."
                  actionLabel="Voltar ao workflow"
                  onAction={() => { window.location.href = `/workflows/${workflow.id}`; }}
                />
              ) : null}
              {!stage8DependencyOk ? (
                <AlertBanner
                  tone="critical"
                  title="Dependência do Stage 7 não atendida"
                  description="Ação sugerida: aproveitar o botão de navegação para retornar ao Stage 7 e concluir a aprovação humana."
                />
              ) : null}
              {stage.status !== "blocked" && stage8DependencyOk ? (
                <AlertBanner tone="info" title="Sem bloqueios ativos" description="As validações mínimas estão satisfeitas para este estágio." />
              ) : null}
            </div>
          </SystemCard>

          <SystemCard title="Observações importantes" description="Lógica do estágio para apoiar decisões rápidas.">
            <ul className="space-y-2 text-sm">
              {io.notes.map((item) => (
                <li key={item} className="rounded-lg border border-dashed p-2">{item}</li>
              ))}
            </ul>
          </SystemCard>
        </div>

        <SystemCard title="Ações do estágio" description="Escolha a próxima ação com confirmação para passos críticos.">
          <div className="space-y-2">
            <Button className="w-full justify-start gap-2" onClick={safeRunStage} disabled={!canRun || isMutating || !stage8DependencyOk}>
              <Play className="h-4 w-4" />
              Executar
            </Button>

            <Button
              className="w-full justify-start gap-2"
              variant="secondary"
              onClick={() => setConfirmAction("rerun")}
              disabled={isMutating || !stage8DependencyOk}
            >
              <RotateCcw className="h-4 w-4" />
              Reexecutar
            </Button>

            <Link href={`/workflows/${workflow.id}/stages/${stage.stage}/outputs`}>
              <Button className="w-full justify-start" variant="outline">
                Ver outputs
              </Button>
            </Link>

            {shouldShowApproveAction ? (
              <Button className="w-full justify-start gap-2" onClick={() => setConfirmAction("approve")} disabled={isMutating || !stage8DependencyOk}>
                <CheckCircle2 className="h-4 w-4" />
                Aprovar estágio
              </Button>
            ) : null}

            <Button
              className="w-full justify-start gap-2"
              variant="default"
              onClick={() => setConfirmAction("advance")}
              disabled={!canAdvance || isMutating || !stage8DependencyOk || !hasNextStage}
            >
              <SkipForward className="h-4 w-4" />
              Avançar para próximo estágio
            </Button>

            {!canAdvance ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                Bloqueado: este estágio ainda não foi aprovado.
              </p>
            ) : null}

            {!hasNextStage ? (
              <p className="rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-700">
                Este workflow já está no último estágio disponível.
              </p>
            ) : null}
          </div>
        </SystemCard>
      </div>

      {confirmAction === "approve" ? (
        <HumanApprovalDialog
          open
          stageNumber={stage.stage}
          stageName={stage.name}
          stageStatusLabel={stage.status}
          stageSummary={latestOutput?.summary ?? "Sem resumo da execução mais recente."}
          outputs={stageArtifacts}
          notes={approvalNotes}
          onNotesChange={setApprovalNotes}
          reviewed={humanReviewed}
          onReviewedChange={setHumanReviewed}
          onClose={() => {
            setConfirmAction(null);
            setHumanReviewed(false);
          }}
          onConfirm={approveStage}
          isSubmitting={isMutating}
        />
      ) : null}

      {confirmAction && confirmAction !== "approve" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-4 shadow-xl">
            <h2 className="text-lg font-semibold">Confirmar ação crítica</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {confirmAction === "rerun" && "Você está prestes a reexecutar o estágio. Isso pode sobrescrever outputs anteriores."}
              {confirmAction === "advance" && "Você está prestes a avançar o workflow para o próximo estágio."}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button onClick={executeConfirmedAction} disabled={isMutating}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {awaitingHumanApproval ? (
        <p className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <Clock3 className="h-4 w-4" />
          Aguardando aprovação humana: sem esse registro o fluxo permanece bloqueado para avanço.
        </p>
      ) : null}

      {stage.status === "approved" || justApproved ? (
        <p className="flex items-center gap-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="h-4 w-4" />
          Status APPROVED confirmado. A ação “Avançar” está liberada para o próximo passo.
        </p>
      ) : null}
    </div>
  );
}
