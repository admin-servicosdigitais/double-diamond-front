import type { Stage, StageStatus } from "@/types/api/domain";

const statusLabelMap: Record<StageStatus, string> = {
  not_started: "Não iniciado",
  running: "Em execução",
  awaiting_human_approval: "Aguardando aprovação humana",
  approved: "Aprovado",
  blocked: "Bloqueado",
  completed: "Concluído",
  error: "Erro",
};

export function getStageStatusLabel(status: StageStatus) {
  return statusLabelMap[status] ?? status;
}

export function isStage8Optional(stage: number) {
  return stage === 8;
}

export function canRunStage(stage: Stage) {
  return stage.canRun ?? (stage.status === "not_started" || stage.status === "error");
}

export function canApproveStage(stage: Stage) {
  return stage.canApprove ?? stage.status === "awaiting_human_approval";
}

export function canGoToNextStage(stage: Stage, isApproved?: boolean) {
  const approved = isApproved ?? stage.status === "approved";
  return stage.canNext ?? approved;
}

export function shouldEnableStage8(stage7Status: StageStatus) {
  return stage7Status === "completed" || stage7Status === "approved";
}
