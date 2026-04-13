import { apiRequest } from "@/services/api/client";
import type {
  ApiListResponse,
  Artifact,
  CreateWorkflowPayload,
  PatchArtifactPayload,
  Stage,
  StageActionResponse,
  StageOutput,
  Workflow,
} from "@/types/api/domain";

export const workflowsService = {
  create: (payload: CreateWorkflowPayload) => apiRequest<Workflow>("/workflows", { method: "POST", body: payload }),
  list: () => apiRequest<ApiListResponse<Workflow> | Workflow[]>("/workflows"),
  getById: (workflowId: string) => apiRequest<Workflow>(`/workflows/${workflowId}`),

  runStage: (workflowId: string, stage: number) =>
    apiRequest<StageActionResponse>(`/workflows/${workflowId}/stages/${stage}/run`, { method: "POST" }),

  approveStage: (workflowId: string, stage: number) =>
    apiRequest<StageActionResponse>(`/workflows/${workflowId}/stages/${stage}/approve`, { method: "POST" }),

  nextStage: (workflowId: string, stage: number) =>
    apiRequest<StageActionResponse>(`/workflows/${workflowId}/stages/${stage}/next`, { method: "POST" }),

  getStage: (workflowId: string, stage: number) => apiRequest<Stage>(`/workflows/${workflowId}/stages/${stage}`),

  getStageOutputs: (workflowId: string, stage: number) =>
    apiRequest<ApiListResponse<StageOutput> | StageOutput[]>(`/workflows/${workflowId}/stages/${stage}/outputs`),

  getLatestAgentOutput: (workflowId: string, agentCode: string) =>
    apiRequest<StageOutput>(`/workflows/${workflowId}/agents/${agentCode}/latest-output`),

  getArtifact: (workflowId: string, stage: number, artifactName: string) =>
    apiRequest<Artifact>(`/workflows/${workflowId}/stages/${stage}/outputs/${artifactName}`),

  patchArtifact: (workflowId: string, stage: number, artifactName: string, payload: PatchArtifactPayload) =>
    apiRequest<Artifact>(`/workflows/${workflowId}/stages/${stage}/outputs/${artifactName}`, {
      method: "PATCH",
      body: payload,
    }),
};
