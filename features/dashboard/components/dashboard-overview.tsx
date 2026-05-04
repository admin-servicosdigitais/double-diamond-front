"use client";

import Link from "next/link";

import { ArrowRight, ShieldCheck, Workflow } from "lucide-react";

import { EmptyState, MetricCard, PremiumPageSkeleton, StatusPill, UXStateCard } from "@/components/system";
import { buttonVariants } from "@/components/ui/button";
import { useWorkflowsQuery } from "@/hooks/api/use-domain-queries";
import { formatDateTimeLabel } from "@/lib/workflow/display";
import { cn } from "@/lib/utils";

export function DashboardOverview() {
  const workflowsQuery = useWorkflowsQuery();

  if (workflowsQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (workflowsQuery.isError) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos carregar o dashboard"
        description="Recarregue para restaurar indicadores e workflows pendentes."
        actionLabel="Atualizar"
        onAction={() => workflowsQuery.refetch()}
      />
    );
  }

  const workflows = workflowsQuery.data ?? [];
  const pendingApproval = workflows.filter((workflow) => workflow.status === "awaiting_human_approval");
  const blocked = workflows.filter((workflow) => workflow.status === "blocked" || workflow.status === "error");
  const active = workflows.filter((workflow) =>
    ["running", "awaiting_human_approval", "approved", "blocked", "error"].includes(workflow.status),
  );

  return (
    <div className="space-y-10">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard label="Workflows ativos" value={String(active.length)} icon={Workflow} helper="Em execução ou pendência" />
        <MetricCard
          label="Aguardando aprovação"
          value={String(pendingApproval.length)}
          icon={ShieldCheck}
          helper="Dependem de ação humana"
          className={pendingApproval.length > 0 ? "border-amber-200 bg-amber-50/70" : undefined}
        />
        <MetricCard label="Bloqueados" value={String(blocked.length)} helper="Com impedimentos ou erro" />
      </section>

      <section className="space-y-4">
        <header className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Aguardando sua aprovação</h2>
          <Link href="/workflows" className="text-xs text-muted-foreground hover:text-foreground">
            Ver todos →
          </Link>
        </header>

        {pendingApproval.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Nada pendente"
            description="Sem decisões humanas bloqueando o fluxo agora."
          />
        ) : (
          <ul className="space-y-2">
            {pendingApproval.map((workflow) => (
              <li
                key={workflow.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200/60 bg-amber-50/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Atualizado {formatDateTimeLabel(workflow.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={workflow.status} showIcon={false} />
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "h-8 gap-1.5")}
                  >
                    Revisar
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
