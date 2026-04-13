import type { Stage, StageStatus } from "@/types/api/domain";

export type StageBlueprint = {
  stage: number;
  name: string;
  description: string;
  optional?: boolean;
};

export const WORKFLOW_STAGE_BLUEPRINTS: StageBlueprint[] = [
  { stage: 1, name: "Diagnóstico inicial", description: "Coleta contexto e valida objetivo operacional do workflow." },
  { stage: 2, name: "Planejamento", description: "Define plano de execução com critérios e entregáveis esperados." },
  { stage: 3, name: "Execução técnica", description: "Produz outputs técnicos iniciais com base no plano." },
  { stage: 4, name: "Validação interna", description: "Confere consistência, qualidade e cobertura dos artefatos." },
  { stage: 5, name: "Aprovação técnica", description: "Confirma aderência aos padrões e requisitos de negócio." },
  { stage: 6, name: "Preparação de entrega", description: "Organiza pacote final, documentação e evidências." },
  { stage: 7, name: "Revisão humana", description: "Solicita validação humana antes de liberar avanço." },
  {
    stage: 8,
    name: "Tratativas condicionais",
    description: "Etapa opcional para ajustes, exceções ou dependências específicas.",
    optional: true,
  },
  { stage: 9, name: "Encerramento", description: "Consolida resultado final e encerra o workflow com rastreabilidade." },
];

export function getStageBlueprint(stageNumber: number) {
  return WORKFLOW_STAGE_BLUEPRINTS.find((item) => item.stage === stageNumber);
}

export function mergeStageWithBlueprint(stageNumber: number, stage?: Stage): Stage {
  const fallbackBlueprint = getStageBlueprint(stageNumber);

  return {
    stage: stageNumber,
    stageKey: stage?.stageKey ?? String(stageNumber),
    status: stage?.status ?? (stageNumber === 1 ? "running" : "not_started"),
    name: stage?.name ?? fallbackBlueprint?.name,
    optional: stage?.optional ?? fallbackBlueprint?.optional,
    requiresApproval: stage?.requiresApproval,
    canRun: stage?.canRun,
    canApprove: stage?.canApprove,
    canNext: stage?.canNext,
    startedAt: stage?.startedAt,
    finishedAt: stage?.finishedAt,
    outputs: stage?.outputs,
  };
}

export function inferStageSummary(stageStatus: StageStatus) {
  if (stageStatus === "awaiting_human_approval") return "Aguardando decisão humana para continuar.";
  if (stageStatus === "blocked") return "Execução bloqueada por dependências ou impeditivos.";
  if (stageStatus === "error") return "Falha detectada. Reexecução pode ser necessária.";
  if (stageStatus === "completed" || stageStatus === "approved") return "Etapa concluída e pronta para transição.";
  if (stageStatus === "running") return "Etapa em execução com geração de novos artefatos.";

  return "Etapa ainda não iniciada.";
}


export function parseStageOrder(stageRef: string | number | undefined, fallback = 1) {
  if (typeof stageRef === "number" && Number.isFinite(stageRef)) return stageRef;
  if (typeof stageRef !== "string") return fallback;

  const match = stageRef.match(/\d+/);
  if (!match) return fallback;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
}
