import type { Workflow } from "@/types/api/workflow";

export const workflowsPlaceholder: Workflow[] = [
  {
    id: "wf-001",
    name: "Lançamento de Campanha B2B",
    description: "Geração de estratégia, criativos e aprovação final.",
    status: "waiting_approval",
    createdAt: "2026-04-01T10:20:00Z",
    updatedAt: "2026-04-13T11:00:00Z",
    currentStageId: "stage-2",
    stages: [
      { id: "stage-1", name: "Discovery", order: 1, status: "completed", requiresApproval: true, artifacts: [] },
      { id: "stage-2", name: "Copy Estratégica", order: 2, status: "waiting_approval", requiresApproval: true, artifacts: [] },
      { id: "stage-3", name: "Execução Multicanal", order: 3, status: "draft", requiresApproval: true, artifacts: [] },
    ],
  },
];
