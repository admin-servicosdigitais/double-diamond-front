"use client";

import Link from "next/link";

import { AlertCircle, ArrowLeft, ListTree } from "lucide-react";

import { PremiumPageSkeleton, SystemCard, UXStateCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAgentQuery } from "@/hooks/api/use-domain-queries";
import type { Agent } from "@/types/api/domain";

function toLabelList(value?: string[] | string) {
  if (!value) return ["Não informado"];
  return Array.isArray(value) ? value : [value];
}

function buildFriendlyExplanation(agent: Agent) {
  const stage = agent.stage ?? "um estágio não informado";
  const role = agent.role ?? "um papel de apoio";

  return `${agent.name} atua no ${stage} com o papel de ${role}. Em termos práticos, ele recebe contexto das entradas anteriores, organiza a informação no formato esperado e entrega um resultado que facilita a próxima decisão do fluxo.`;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border bg-background px-3 py-2">
      <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export function AgentDetailsView({ agentId }: { agentId: string }) {
  const agentQuery = useAgentQuery(agentId);
  const agent = agentQuery.data;

  if (agentQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (agentQuery.isError || !agent) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos carregar o perfil deste agente"
        description="Recarregue para recuperar modelo, responsabilidades e rastreabilidade operacional."
        actionLabel="Recarregar perfil"
        onAction={() => agentQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Stage: {agent.stage ?? "Não informado"}</Badge>
              <Badge variant="secondary">Role: {agent.role ?? "Não informado"}</Badge>
            </div>
            <h1 className="text-2xl font-semibold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">
              {agent.description ?? "Sem descrição detalhada cadastrada para este agente."}
            </p>
          </div>
          <Link href="/agents">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para catálogo
            </Button>
          </Link>
        </div>
      </section>

      <SystemCard
        title="Ficha técnica do agente"
        description="Campos principais para entender como esse agente opera no pipeline sem excesso de tecnicismo."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Model" value={agent.model ?? "Não informado"} />
          <Field label="Input from" value={<div className="flex flex-wrap gap-1">{toLabelList(agent.input_from).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>} />
          <Field
            label="Output templates"
            value={<div className="flex flex-wrap gap-1">{toLabelList(agent.output_templates).map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>}
          />
          <Field label="Summary format" value={agent.summary_format ?? "Não informado"} />
        </div>
      </SystemCard>

      <SystemCard
        title="Como esse agente ajuda no processo"
        description="Leitura rápida para qualquer pessoa entender o papel operacional desse agente."
      >
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <ListTree className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            {buildFriendlyExplanation(agent)}
          </p>
        </div>
      </SystemCard>

      <SystemCard
        title="Identificadores"
        description="Informações de rastreabilidade para integrar com monitoramento e auditoria."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="ID" value={agent.id} />
          <Field label="Code" value={agent.code} />
        </div>
      </SystemCard>
    </div>
  );
}
