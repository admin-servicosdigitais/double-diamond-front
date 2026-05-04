"use client";

import Link from "next/link";

import { ArrowLeft, ChevronDown } from "lucide-react";

import { PremiumPageSkeleton, UXStateCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAgentQuery } from "@/hooks/api/use-domain-queries";
import { cn } from "@/lib/utils";
import type { Agent } from "@/types/api/domain";

function toLabelList(value?: string[] | string) {
  if (!value) return ["—"];
  return Array.isArray(value) ? value : [value];
}

function buildFriendlyExplanation(agent: Agent) {
  const stage = agent.stage ?? "um estágio não informado";
  const role = agent.role ?? "um papel de apoio";
  return `${agent.name} atua no ${stage} com o papel de ${role}. Recebe contexto das entradas anteriores, organiza no formato esperado e entrega um resultado que facilita a próxima decisão.`;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="surface-soft space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{value}</div>
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
        title="Não conseguimos carregar este agente"
        description="Recarregue para restaurar modelo, responsabilidades e rastreabilidade."
        actionLabel="Recarregar"
        onAction={() => agentQuery.refetch()}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-3">
        <Link href="/agents" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 gap-1 px-2 text-xs")}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Catálogo
        </Link>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] uppercase">{agent.stage ?? "—"}</Badge>
            <Badge variant="secondary" className="text-[10px] uppercase">{agent.role ?? "—"}</Badge>
          </div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{agent.name}</h2>
          <p className="text-sm text-muted-foreground">{buildFriendlyExplanation(agent)}</p>
        </div>
      </header>

      <Collapsible className="rounded-lg border border-border/60">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium"
          >
            <span>Especificação técnica</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-border/60 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Model" value={agent.model ?? "—"} />
            <Field
              label="Input from"
              value={
                <div className="flex flex-wrap gap-1">
                  {toLabelList(agent.input_from).map((item) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              }
            />
            <Field
              label="Output templates"
              value={
                <div className="flex flex-wrap gap-1">
                  {toLabelList(agent.output_templates).map((item) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                </div>
              }
            />
            <Field label="Summary format" value={agent.summary_format ?? "—"} />
            <Field label="ID" value={<span className="font-mono text-xs">{agent.id}</span>} />
            <Field label="Code" value={<span className="font-mono text-xs">{agent.code}</span>} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
