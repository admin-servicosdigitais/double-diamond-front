"use client";

import Link from "next/link";

import { ArrowRight, Bot } from "lucide-react";

import { EmptyState, PremiumPageSkeleton, UXStateCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { useAgentsQuery } from "@/hooks/api/use-domain-queries";
import type { Agent } from "@/types/api/domain";

function getAgentStage(agent: Agent) {
  return agent.stage ?? "Não informado";
}

function getAgentRole(agent: Agent) {
  return agent.role ?? "Sem papel definido";
}

function getShortDescription(agent: Agent) {
  if (agent.shortDescription) return agent.shortDescription;
  if (agent.description) return agent.description;
  return "Este agente ainda não possui descrição cadastrada.";
}

export function AgentsCatalogView() {
  const agentsQuery = useAgentsQuery();
  const agents = agentsQuery.data ?? [];

  if (agentsQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (agentsQuery.isError) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos abrir o catálogo de agentes"
        description="Recarregue para restaurar o inventário."
        actionLabel="Recarregar"
        onAction={() => agentsQuery.refetch()}
      />
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="Catálogo vazio"
        description="Cadastre o primeiro agente para começar a distribuir responsabilidades por estágio."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <Link
          key={agent.id}
          href={`/agents/${agent.id}`}
          className="focus-ring group flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 transition hover:border-border hover:bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">{getAgentStage(agent)}</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{getAgentRole(agent)}</Badge>
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-semibold text-foreground">{agent.name}</h3>
            <p className="line-clamp-3 text-sm text-muted-foreground">{getShortDescription(agent)}</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
            Abrir agente
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
