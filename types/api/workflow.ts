export type WorkflowStatus = "draft" | "running" | "waiting_approval" | "completed" | "failed";

export interface StageArtifact {
  id: string;
  name: string;
  mimeType: string;
  content: string;
  updatedAt: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  status: WorkflowStatus;
  requiresApproval: boolean;
  lastExecutionAt?: string;
  artifacts: StageArtifact[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  currentStageId?: string;
  stages: WorkflowStage[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
