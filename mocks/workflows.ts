import type { Workflow } from "@/types/api/domain";

export const workflowsPlaceholder: Workflow[] = [
  {
    id: "wf-001",
    name: "Lançamento de Campanha B2B",
    description: "Geração de estratégia, criativos e aprovação final.",
    status: "awaiting_human_approval",
    createdAt: "2026-04-01T10:20:00Z",
    updatedAt: "2026-04-13T11:00:00Z",
    currentStage: 2,
    stages: [
      { stage: 1, name: "Discovery", status: "completed", requiresApproval: true },
      { stage: 2, name: "Copy Estratégica", status: "awaiting_human_approval", requiresApproval: true },
      { stage: 3, name: "Execução Multicanal", status: "not_started", requiresApproval: true },
    ],
  },
];
