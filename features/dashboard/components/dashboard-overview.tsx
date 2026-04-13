"use client";

import Link from "next/link";

import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LoaderCircle, ShieldCheck, Workflow } from "lucide-react";

import { AlertBanner, EmptyState, MetricCard, PremiumPageSkeleton, StatusPill, SystemCard, UXStateCard } from "@/components/system";
import { buttonVariants } from "@/components/ui/button";
import { useHealthQuery, useWorkflowsQuery } from "@/hooks/api/use-domain-api";
import { cn } from "@/lib/utils";
import type { HealthStatus, Workflow as WorkflowType } from "@/types/api/domain";

function formatDateTime(date?: string) {
  if (!date) return "Sem atualização";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sem atualização";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getCurrentStageLabel(workflow: WorkflowType) {
  if (!workflow.currentStage) return "Não iniciado";

  const currentStage = workflow.stages?.find((stage) => stage.stage === workflow.currentStage);
  if (currentStage?.name) {
    return `${currentStage.stage}. ${currentStage.name}`;
  }

  return `Etapa ${workflow.currentStage}`;
}

function getNextAction(workflow: WorkflowType) {
  if (workflow.status === "awaiting_human_approval") return "Revisar e aprovar estágio";
  if (workflow.status === "blocked") return "Desbloquear dependências";
  if (workflow.status === "running") return "Acompanhar execução";
  if (workflow.status === "error") return "Investigar falha do estágio";
  if (workflow.status === "completed") return "Validar entrega final";

  return "Iniciar execução do workflow";
}

function getHealthTone(status?: HealthStatus) {
  if (status === "ok") return "success" as const;
  if (status === "degraded") return "warning" as const;
  return "critical" as const;
}

function DashboardSkeleton() {
  return <PremiumPageSkeleton />;
}

export function DashboardOverview() {
  const workflowsQuery = useWorkflowsQuery();
  const healthQuery = useHealthQuery();

  if (workflowsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (workflowsQuery.isError) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos montar a visão executiva do dashboard"
        description="Recarregue em alguns segundos para restaurar indicadores, filas críticas e recomendações de ação."
        actionLabel="Atualizar dashboard"
        onAction={() => workflowsQuery.refetch()}
      />
    );
  }

  const workflows = workflowsQuery.data ?? [];
  const pendingApproval = workflows.filter((workflow) => workflow.status === "awaiting_human_approval");
  const running = workflows.filter((workflow) => workflow.status === "running");
  const blocked = workflows.filter((workflow) => workflow.status === "blocked" || workflow.status === "error");
  const completed = workflows.filter((workflow) => workflow.status === "completed");
  const active = workflows.filter((workflow) =>
    ["running", "awaiting_human_approval", "approved", "blocked", "error"].includes(workflow.status),
  );

  const recentWorkflows = [...workflows]
    .sort((a, b) => new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() - new Date(a.updatedAt ?? a.createdAt ?? 0).getTime())
    .slice(0, 8);

  const metricCards = [
    { label: "Workflows ativos", value: String(active.length), icon: Workflow, helper: "Com execução ou pendências" },
    {
      label: "Aguardando aprovação",
      value: String(pendingApproval.length),
      icon: Clock3,
      helper: "Dependem de ação humana",
      className: "border-amber-200 bg-amber-50/70",
    },
    { label: "Em execução", value: String(running.length), icon: LoaderCircle, helper: "Stages em processamento" },
    { label: "Bloqueados", value: String(blocked.length), icon: AlertCircle, helper: "Com impedimentos ou erro" },
    { label: "Concluídos", value: String(completed.length), icon: CheckCircle2, helper: "Finalizados com sucesso" },
  ];

  const healthStatus = healthQuery.data?.status;
  const dependencies = Object.entries(healthQuery.data?.dependencies ?? {});

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h1>Dashboard operacional</h1>
        <p className="text-sm text-muted-foreground">
          Visão rápida da operação para priorizar o que precisa de ação humana agora.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            helper={metric.helper}
            className={metric.className}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SystemCard
          title="Ação necessária agora"
          description="Workflows com revisão/aprovação humana pendente para não comprometer SLA."
        >
          {pendingApproval.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Tudo em dia nas aprovações humanas"
              description="Excelente ritmo: não há decisões pendentes bloqueando o SLA neste momento."
            />
          ) : (
            <div className="space-y-3">
              {pendingApproval.map((workflow) => (
                <div key={workflow.id} className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">{workflow.id}</p>
                    </div>
                    <StatusPill status={workflow.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Última atualização: {formatDateTime(workflow.updatedAt)}</p>
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className={cn(buttonVariants({ size: "sm" }), "gap-2")}
                    >
                      Abrir workflow
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SystemCard>

        <SystemCard title="Health da API" description="Resumo de disponibilidade para tomada de decisão rápida.">
          {healthQuery.isLoading ? (
            <div className="space-y-3">
              <SystemSkeleton className="h-16 rounded-lg" />
              <SystemSkeleton className="h-10 rounded-lg" />
              <SystemSkeleton className="h-10 rounded-lg" />
            </div>
          ) : healthQuery.isError ? (
            <UXStateCard
              kind="error"
              title="Monitoramento de health indisponível"
              description="Sem telemetria agora, mas o produto segue disponível. Atualize para recuperar visibilidade dos serviços."
              actionLabel="Atualizar health"
              onAction={() => healthQuery.refetch()}
            />
          ) : (
            <div className="space-y-3">
              <AlertBanner
                tone={getHealthTone(healthStatus)}
                title={`Status geral: ${healthStatus ?? "indisponível"}`}
                description={`Serviço: ${healthQuery.data?.service ?? "API"} • Versão: ${healthQuery.data?.version ?? "n/d"}`}
              />
              <p className="text-xs text-muted-foreground">Última verificação: {formatDateTime(healthQuery.data?.timestamp)}</p>
              {dependencies.length > 0 ? (
                <ul className="space-y-2">
                  {dependencies.map(([name, status]) => (
                    <li key={name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{String(status)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Dependências não informadas pela API.</p>
              )}
            </div>
          )}
        </SystemCard>
      </section>

      <SystemCard
        title="Workflows recentes"
        description="Panorama com contexto operacional e próxima ação sugerida para cada fluxo."
      >
        {recentWorkflows.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="Seu painel ainda não tem workflows recentes"
            description="Assim que novos fluxos forem iniciados, você verá aqui status, risco e próxima ação recomendada."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-[0.06em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Workflow ID</th>
                  <th className="px-4 py-3">Estágio atual</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Última atualização</th>
                  <th className="px-4 py-3">Próxima ação</th>
                  <th className="px-4 py-3 text-right">CTA</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkflows.map((workflow) => (
                  <tr key={workflow.id} className="border-t align-top">
                    <td className="px-4 py-3 font-medium">{workflow.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{workflow.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getCurrentStageLabel(workflow)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={workflow.status} showIcon={false} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(workflow.updatedAt ?? workflow.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{getNextAction(workflow)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/workflows/${workflow.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}>
                        Abrir
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SystemCard>
    </div>
  );
}
