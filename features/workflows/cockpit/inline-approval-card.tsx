"use client";

import { useState } from "react";
import { Check, ChevronDown, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { systemToast } from "@/components/system";
import { useApproveAndAdvance, type AdvancePhase } from "@/hooks/use-approve-and-advance";
import { getErrorMessage } from "@/services/api/client";
import type { Stage, StageOutput } from "@/types/api/domain";

type AutoRunOutcome = { failed: true; message?: string } | null;

type Props = {
  workflowId: string;
  stage: Stage;
  outputs: StageOutput[] | undefined;
  summary?: string;
  onApproved?: (nextStageKey?: string, autoRun?: AutoRunOutcome) => void;
};

const MAX_VISIBLE_ARTIFACTS = 3;

const PHASE_LABEL: Record<AdvancePhase, string> = {
  idle: "Aprovar e avançar",
  approving: "Aprovando estágio…",
  advancing: "Avançando workflow…",
  "running-next": "Iniciando próximo estágio…",
};

function getArtifactNames(outputs: StageOutput[] | undefined): string[] {
  if (!outputs?.length) return [];
  return outputs.flatMap((output) => (output.artifacts ?? []).map((artifact) => artifact.name));
}

export function InlineApprovalCard({ workflowId, stage, outputs, summary, onApproved }: Props) {
  const [notes, setNotes] = useState("");
  const { execute, isPending, phase } = useApproveAndAdvance();

  const artifactNames = getArtifactNames(outputs);
  const visibleArtifacts = artifactNames.slice(0, MAX_VISIBLE_ARTIFACTS);
  const hiddenCount = Math.max(artifactNames.length - visibleArtifacts.length, 0);

  async function handleApprove() {
    try {
      const result = await execute({ workflowId, currentStage: stage });

      if (result.autoRunFailed) {
        systemToast.warning(
          "Estágio aprovado, mas o próximo precisa ser reexecutado",
          result.autoRunError ?? "Use o botão Reexecutar no painel para iniciar manualmente.",
        );
      } else {
        systemToast.success(
          "Estágio aprovado",
          result.nextStage
            ? `Avançado para o estágio ${result.nextStage}.`
            : "Aprovação registrada.",
        );
      }

      onApproved?.(
        result.nextStageKey,
        result.autoRunFailed ? { failed: true, message: result.autoRunError } : null,
      );
    } catch (error) {
      systemToast.error("Erro ao aprovar", getErrorMessage(error) ?? "Não foi possível concluir a aprovação.");
    }
  }

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline" className="border-amber-300 bg-amber-100/70 text-[10px] uppercase tracking-wide text-amber-800">
            Aguardando aprovação humana
          </Badge>
          <p className="max-w-xl text-sm text-foreground">
            {summary ?? "Revise as evidências do estágio e aprove para liberar o próximo passo."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isPending}
            className="h-11 min-w-[220px] gap-2 text-sm font-semibold"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {PHASE_LABEL[phase]}
          </Button>
          {isPending ? (
            <p className="text-[11px] text-muted-foreground" aria-live="polite">
              {phase === "approving" ? "1 de 3" : phase === "advancing" ? "2 de 3" : "3 de 3"}
            </p>
          ) : null}
        </div>
      </header>

      {visibleArtifacts.length > 0 ? (
        <ul className="mt-4 space-y-1.5">
          {visibleArtifacts.map((name) => (
            <li key={name} className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="truncate">{name}</span>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li className="text-xs text-muted-foreground">
              + {hiddenCount} {hiddenCount === 1 ? "outro artefato" : "outros artefatos"} no painel abaixo.
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-4 space-y-2">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Adicionar nota (opcional)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Observações sobre a decisão (não enviadas, apenas para uso pessoal)…"
              className="min-h-[80px] text-sm"
            />
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Auditoria (não bloqueante)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1.5 pt-2 text-xs text-muted-foreground">
            <p>• Resumo executivo revisado</p>
            <p>• Outputs críticos verificados</p>
            <p>• Riscos considerados antes de aprovar</p>
            <p className="pt-1 italic">A auditoria registra a intenção, mas não bloqueia a aprovação.</p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
