"use client";

import Link from "next/link";

import { AlertCircle, ArrowRight, Bot } from "lucide-react";

import { EmptyState, PremiumPageSkeleton, UXStateCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        description="Houve uma oscilação ao consultar o inventário. Recarregue para recuperar a lista completa."
        actionLabel="Recarregar catálogo"
        onAction={() => agentsQuery.refetch()}
      />
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={Bot}
        title="Catálogo vazio por enquanto"
        description="Cadastre o primeiro agente para começar a distribuir responsabilidades por estágio e papel."
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-1">
        <h1>Agents</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo funcional dos agentes disponíveis no sistema, com foco em transparência de papel e estágio.
        </p>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Stage: {getAgentStage(agent)}</Badge>
                <Badge variant="secondary">Role: {getAgentRole(agent)}</Badge>
              </div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <CardDescription className="line-clamp-3">{getShortDescription(agent)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/agents/${agent.id}`}>
                <Button className="w-full justify-between" variant="outline">
                  Ver detalhes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
