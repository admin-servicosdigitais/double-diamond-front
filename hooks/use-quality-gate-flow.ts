"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  useAnswerQualityGateMutation,
  useGenerateQualityGateMutation,
  useRunStageMutation,
  useSkipQualityGateMutation,
} from "@/hooks/api/use-domain-queries";
import type { QualityGate, QualityGateAnswer, Stage } from "@/types/api/domain";

type Args = {
  workflowId: string;
  stage: Stage;
  initialGate?: QualityGate;
};

export function useQualityGateFlow({ workflowId, stage, initialGate }: Args) {
  const queryClient = useQueryClient();
  const generate = useGenerateQualityGateMutation();
  const answer = useAnswerQualityGateMutation();
  const skip = useSkipQualityGateMutation();
  const run = useRunStageMutation();

  const [gate, setGate] = useState<QualityGate | null>(initialGate ?? null);
  const [open, setOpen] = useState(Boolean(initialGate && initialGate.status !== "completed"));

  const stageRef = stage.stageKey ?? stage.stage;

  const start = useCallback(async () => {
    setOpen(true);
    if (gate && gate.status !== "completed") return;

    const next = await generate.mutateAsync({ workflowId, stage: stageRef });
    setGate(next);
  }, [gate, generate, stageRef, workflowId]);

  const submitAnswers = useCallback(
    async (answers: QualityGateAnswer[]) => {
      const updated = await answer.mutateAsync({ workflowId, stage: stageRef, answers });
      setGate(updated);

      try {
        await run.mutateAsync({ workflowId, stage: stageRef });
      } catch {
        // best-effort: o usuário ainda pode reexecutar manualmente
      }

      // Invalida por prefixo: pega workflow + stage + outputs sem depender do tipo (number/string).
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });

      setGate(null);
      setOpen(false);

      return updated;
    },
    [answer, queryClient, run, stageRef, workflowId],
  );

  const dismiss = useCallback(
    async (reason?: string) => {
      try {
        await skip.mutateAsync({ workflowId, stage: stageRef, reason });
      } catch {
        // skip remoto opcional — fechar UI mesmo assim
      }
      setGate(null);
      setOpen(false);
    },
    [skip, stageRef, workflowId],
  );

  return {
    gate,
    open,
    start,
    submitAnswers,
    dismiss,
    closeWithoutDismiss: () => setOpen(false),
    isGenerating: generate.isPending,
    isAnswering: answer.isPending || run.isPending,
    isSkipping: skip.isPending,
  } as const;
}
