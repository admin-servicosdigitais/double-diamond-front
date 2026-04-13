"use client";

import { CheckCircle2, ClipboardCheck, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Artifact } from "@/types/api/domain";

type HumanApprovalDialogProps = {
  open: boolean;
  stageNumber: number;
  stageName?: string;
  stageStatusLabel: string;
  stageSummary: string;
  outputs: Artifact[];
  notes: string;
  onNotesChange: (value: string) => void;
  reviewed: boolean;
  onReviewedChange: (value: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
};

export function HumanApprovalDialog({
  open,
  stageNumber,
  stageName,
  stageStatusLabel,
  stageSummary,
  outputs,
  notes,
  onNotesChange,
  reviewed,
  onReviewedChange,
  onClose,
  onConfirm,
  isSubmitting = false,
}: HumanApprovalDialogProps) {
  if (!open) return null;

  const checklist = [
    { label: "Resumo do estágio conferido", icon: ClipboardCheck, done: Boolean(stageSummary) },
    { label: "Outputs relevantes revisados", icon: FileText, done: outputs.length > 0 },
    { label: "Impactos e governança considerados", icon: ShieldCheck, done: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border-2 border-amber-500 bg-background p-5 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Aprovação humana obrigatória</p>
        <h2 className="mt-1 text-xl font-semibold">Aprovar estágio {stageNumber}</h2>
        <p className="text-sm text-muted-foreground">{stageName ?? "Sem nome"} • Status atual: {stageStatusLabel}</p>

        <section className="mt-4 space-y-2 rounded-lg border bg-muted/20 p-3">
          <p className="text-sm font-medium">Resumo do estágio</p>
          <p className="text-sm text-muted-foreground">{stageSummary}</p>
        </section>

        <section className="mt-4 space-y-2">
          <p className="text-sm font-medium">Outputs disponíveis</p>
          {outputs.length === 0 ? (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Nenhum output listado para revisão.</p>
          ) : (
            <ul className="space-y-2">
              {outputs.slice(0, 6).map((artifact) => (
                <li key={`${artifact.name}-${artifact.updatedAt}`} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{artifact.name}</span>
                  <Badge variant="outline">{artifact.mimeType ?? "tipo não informado"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-4 space-y-2">
          <p className="text-sm font-medium">Checklist de revisão</p>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                <item.icon className="h-4 w-4 text-emerald-600" />
                <span>{item.label}</span>
                {item.done ? <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" /> : <Badge variant="secondary">Pendente</Badge>}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 space-y-2">
          <label className="text-sm font-medium" htmlFor="approval-notes">
            Observações do operador (opcional)
          </label>
          <Textarea
            id="approval-notes"
            placeholder="Registre racional da decisão, riscos aceitos ou ressalvas."
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
          />
        </section>

        <label className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={reviewed}
            onChange={(event) => onReviewedChange(event.target.checked)}
          />
          <span>Revisei os artefatos e autorizo o avanço deste estágio.</span>
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!reviewed || isSubmitting}>
            Confirmar aprovação
          </Button>
        </div>
      </div>
    </div>
  );
}
