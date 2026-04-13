"use client";

import { Activity, Archive, CheckCircle2, ClipboardCheck, Clock3, FilePlus2, Sparkles } from "lucide-react";

import {
  ActionCard,
  AlertBanner,
  ArtifactCard,
  ContextPanel,
  EmptyState,
  MetricCard,
  StageActionToolbar,
  StageStepper,
  SystemCard,
  WorkflowListSkeleton,
  WorkflowTable,
} from "@/components/system";
import { useWorkflows } from "@/hooks/use-workflows";

import { QuickWorkflowForm } from "./quick-workflow-form";

const metricCards = [
  { label: "Fluxos ativos", value: "12", icon: Activity, helper: "+2 na última hora" },
  { label: "Aguardando aprovação", value: "5", icon: Clock3, helper: "2 em SLA crítico" },
  { label: "Concluídos hoje", value: "7", icon: CheckCircle2, helper: "95% sem retrabalho" },
];

export function DashboardOverview() {
  const { data, isLoading } = useWorkflows();

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Design System Operacional SaaS
          </p>
          <h1>Controle humano sobre workflows com IA</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Experiência visual premium e limpa para status, progresso, revisão, aprovação e artefatos.
          </p>
        </div>
        <AlertBanner
          tone="info"
          title="Atenção operacional"
          description="Você possui 3 estágios aguardando aprovação humana para manter o fluxo dentro do SLA."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <StageStepper
        steps={[
          { id: "1", label: "Briefing", status: "completed" },
          { id: "2", label: "Pesquisa", status: "running", active: true },
          { id: "3", label: "Revisão", status: "awaiting_human_approval" },
          { id: "4", label: "Entrega", status: "not_started" },
        ]}
      />

      <StageActionToolbar />

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <SystemCard
          title="Lista de workflows"
          description="Padrão de tabela para acompanhamento de execução com status e ação rápida."
        >
          {isLoading ? (
            <WorkflowListSkeleton />
          ) : data && data.length > 0 ? (
            <WorkflowTable workflows={data} />
          ) : (
            <EmptyState
              icon={Archive}
              title="Nenhum workflow encontrado"
              description="Crie o primeiro fluxo para iniciar a orquestração com checkpoints de aprovação humana."
              actionLabel="Criar workflow"
            />
          )}
        </SystemCard>

        <div className="space-y-4">
          <QuickWorkflowForm />
          <ContextPanel />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ArtifactCard name="Resumo de análise" type="application/pdf" updatedAt="Atualizado há 9 min" />
        <ActionCard
          icon={ClipboardCheck}
          title="Revisar artefatos"
          description="Valide conteúdo gerado por IA antes de aprovar o estágio."
          cta="Abrir revisão"
        />
        <ActionCard
          icon={FilePlus2}
          title="Adicionar instrução"
          description="Anexe nova diretriz operacional para manter rastreabilidade."
          cta="Adicionar"
        />
      </section>
    </div>
  );
}
