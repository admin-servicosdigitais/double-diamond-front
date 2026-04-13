import type { Workflow } from "@/types/api/domain";

export function formatWorkflowDate(date?: string) {
  if (!date) return "Sem atualização";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sem atualização";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function getCurrentStageLabel(workflow: Workflow) {
  if (!workflow.currentStage) return "Não iniciado";

  const currentStage = workflow.stages?.find((stage) => stage.stage === workflow.currentStage);
  if (currentStage?.name) {
    return `${currentStage.stage}. ${currentStage.name}`;
  }

  return `Etapa ${workflow.currentStage}`;
}

export function getNextActionLabel(workflow: Workflow) {
  if (workflow.status === "awaiting_human_approval") return "Revisar e aprovar estágio";
  if (workflow.status === "blocked") return "Desbloquear dependências";
  if (workflow.status === "running") return "Acompanhar execução";
  if (workflow.status === "error") return "Investigar falha";
  if (workflow.status === "completed") return "Validar entrega final";

  return "Iniciar workflow";
}
