"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatWorkflowDate } from "@/lib/workflow/display";
import { inferStageSummary } from "@/lib/workflow/stages";
import type { Stage } from "@/types/api/domain";

type Props = {
  stage: Stage;
};

function StageInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-baseline gap-2 text-xs">
      <span className="font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export function StageAuditCollapsible({ stage }: Props) {
  return (
    <Collapsible className="rounded-lg border border-border/60">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between gap-2 rounded-lg px-4 py-3 text-sm font-medium"
        >
          <span>Detalhes operacionais e auditoria</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-border/60 px-4 py-3">
        <StageInfoRow label="Resumo" value={inferStageSummary(stage.status)} />
        <StageInfoRow label="Iniciado em" value={formatWorkflowDate(stage.startedAt)} />
        <StageInfoRow label="Finalizado em" value={formatWorkflowDate(stage.finishedAt)} />
        <StageInfoRow label="Estágio chave" value={stage.stageKey ?? String(stage.stage)} />
        {stage.optional ? (
          <StageInfoRow label="Opcional" value="Sim — pode ser pulado conforme regras de negócio." />
        ) : null}
        {stage.requiresApproval ? (
          <StageInfoRow label="Requer aprovação" value="Sim — liberação humana obrigatória." />
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
