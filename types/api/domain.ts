export type ApiListResponse<T> = {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
};

export type HealthStatus = "ok" | "degraded" | "error";

export interface Health {
  status: HealthStatus;
  service?: string;
  version?: string;
  timestamp?: string;
  dependencies?: Record<string, HealthStatus | string>;
}

export interface Agent {
  id: string;
  code: string;
  name: string;
  description?: string;
  shortDescription?: string;
  stage?: string;
  model?: string;
  role?: string;
  input_from?: string[] | string;
  output_templates?: string[] | string;
  summary_format?: string;
  enabled?: boolean;
  capabilities?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type StageStatus =
  | "not_started"
  | "running"
  | "awaiting_human_approval"
  | "approved"
  | "blocked"
  | "completed"
  | "error";

export type WorkflowStatus = StageStatus;

export interface Artifact {
  name: string;
  mimeType?: string;
  content?: string;
  path?: string;
  size?: number;
  updatedAt?: string;
}

export interface StageOutput {
  id?: string;
  stage: number;
  agentCode?: string;
  summary?: string;
  content?: string;
  artifacts?: Artifact[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Stage {
  stage: number;
  name?: string;
  status: StageStatus;
  optional?: boolean;
  requiresApproval?: boolean;
  canRun?: boolean;
  canApprove?: boolean;
  canNext?: boolean;
  startedAt?: string;
  finishedAt?: string;
  outputs?: StageOutput[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  currentStage?: number;
  createdAt?: string;
  updatedAt?: string;
  stages?: Stage[];
}

export interface CreateWorkflowPayload {
  name: string;
  description?: string;
  input?: Record<string, unknown>;
}

export interface StageActionResponse {
  workflowId: string;
  stage: number;
  status: StageStatus;
  message?: string;
}

export interface PatchArtifactPayload {
  content: string;
  mimeType?: string;
  reason?: string;
}
