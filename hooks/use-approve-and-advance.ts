"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  domainQueryKeys,
  useApproveStageMutation,
  useNextStageMutation,
  useRunStageMutation,
} from "@/hooks/api/use-domain-queries";
import { getErrorMessage } from "@/services/api/client";
import type { Stage } from "@/types/api/domain";

type ApproveAndAdvanceArgs = {
  workflowId: string;
  currentStage: Stage;
  autoRunNext?: boolean;
};

export type AdvancePhase = "idle" | "approving" | "advancing" | "running-next";

export type ApproveAndAdvanceResult = {
  /** Número do próximo estágio (somente para sincronizar UI/URL). */
  nextStage?: number;
  /** Identificador composto do próximo estágio (ex: "2-intake"). */
  nextStageKey?: string;
  autoRunFailed: boolean;
  autoRunError?: string;
};

export function useApproveAndAdvance() {
  const queryClient = useQueryClient();
  const approve = useApproveStageMutation();
  const next = useNextStageMutation();
  const run = useRunStageMutation();

  const [phase, setPhase] = useState<AdvancePhase>("idle");

  const isPending = phase !== "idle";

  async function execute({
    workflowId,
    currentStage,
    autoRunNext = true,
  }: ApproveAndAdvanceArgs): Promise<ApproveAndAdvanceResult> {
    const stageRef = currentStage.stageKey;
    let autoRunFailed = false;
    let autoRunError: string | undefined;
    let nextStageNumber: number | undefined;
    let nextStageKey: string | undefined;

    try {
      setPhase("approving");
      await approve.mutateAsync({ workflowId, stage: stageRef });

      setPhase("advancing");
      const nextResp = await next.mutateAsync({
        workflowId,
        stage: stageRef,
        currentStage: { ...currentStage, status: "approved" },
      });
      nextStageNumber = nextResp?.stage;
      nextStageKey = nextResp?.stageKey;

      if (autoRunNext && nextStageKey) {
        setPhase("running-next");
        try {
          const runResp = await run.mutateAsync({ workflowId, stage: nextStageKey });
          if (runResp?.status === "error") {
            autoRunFailed = true;
            autoRunError = runResp.message ?? "O estágio foi iniciado mas terminou em erro.";
          }
        } catch (error) {
          autoRunFailed = true;
          autoRunError = getErrorMessage(error) ?? "Não foi possível iniciar o próximo estágio automaticamente.";
        }
      }

      return { nextStage: nextStageNumber, nextStageKey, autoRunFailed, autoRunError };
    } finally {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.workflows });
      // Invalida por prefixo: pega workflow + todos os stages + todos os outputs do workflow,
      // independente de a chave do estágio ser number ou string.
      queryClient.invalidateQueries({ queryKey: ["workflows", workflowId] });
      setPhase("idle");
    }
  }

  return { execute, isPending, phase } as const;
}
