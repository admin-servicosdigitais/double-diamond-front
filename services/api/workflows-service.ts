import { ApiError, apiRequest } from "@/services/api/client";
import {
  normalizeArtifactResponse,
  normalizeStage,
  normalizeStageActionResponse,
  normalizeStageOutputs,
  normalizeWorkflow,
} from "@/services/api/adapters";
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

function toStageParam(stage: number | string) {
  return encodeURIComponent(String(stage));
}

function toArtifactParam(artifactName: string) {
  return encodeURIComponent(artifactName);
}

export const workflowsService = {
  async create(payload: CreateWorkflowPayload): Promise<Workflow> {
    const response = await apiRequest<unknown>("/workflows", { method: "POST", body: payload });
    return normalizeWorkflow(response);
  },

  async list(): Promise<ApiListResponse<Workflow> | Workflow[]> {
    const response = await apiRequest<unknown>("/workflows");
    if (Array.isArray(response)) {
      return response.map(normalizeWorkflow);
    }

    const data = (response ?? {}) as { items?: unknown[] };
    if (Array.isArray(data.items)) {
      return { items: data.items.map(normalizeWorkflow) };
    }

    return { items: [] };
  },

  async getById(workflowId: string): Promise<Workflow> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}`);
    return normalizeWorkflow(response);
  },

  async runStage(workflowId: string, stage: number | string): Promise<StageActionResponse> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}/stages/${toStageParam(stage)}/run`, {
      method: "POST",
      body: {},
    });
    return normalizeStageActionResponse(response, workflowId, stage);
  },

  async approveStage(workflowId: string, stage: number | string): Promise<StageActionResponse> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}/stages/${toStageParam(stage)}/approve`, {
      method: "POST",
    });
    return normalizeStageActionResponse(response, workflowId, stage);
  },

  async nextStage(workflowId: string, stage: number | string): Promise<StageActionResponse> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}/stages/${toStageParam(stage)}/next`, {
      method: "POST",
      body: {},
    });
    return normalizeStageActionResponse(response, workflowId, stage);
  },

  async getStage(workflowId: string, stage: number | string): Promise<Stage> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}/stages/${toStageParam(stage)}`);
    return normalizeStage(response, stage);
  },

  async getStageOutputs(workflowId: string, stage: number | string): Promise<ApiListResponse<StageOutput> | StageOutput[]> {
    try {
      const response = await apiRequest<unknown>(`/workflows/${workflowId}/stages/${toStageParam(stage)}/outputs`);
      return normalizeStageOutputs(response, stage);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async getLatestAgentOutput(workflowId: string, agentCode: string): Promise<StageOutput> {
    const response = await apiRequest<unknown>(`/workflows/${workflowId}/agents/${agentCode}/latest-output`);
    return normalizeStageOutputs(response, "1")[0] ?? { stage: 1, artifacts: [] };
  },

  async getArtifact(workflowId: string, stage: number | string, artifactName: string): Promise<Artifact> {
    const response = await apiRequest<unknown>(
      `/workflows/${workflowId}/stages/${toStageParam(stage)}/outputs/${toArtifactParam(artifactName)}`,
    );
    return normalizeArtifactResponse(response, artifactName);
  },

  async patchArtifact(workflowId: string, stage: number | string, artifactName: string, payload: PatchArtifactPayload): Promise<Artifact> {
    const response = await apiRequest<unknown>(
      `/workflows/${workflowId}/stages/${toStageParam(stage)}/outputs/${toArtifactParam(artifactName)}`,
      {
        method: "PATCH",
        body: { content: payload.content },
      },
    );
    return normalizeArtifactResponse(response, artifactName);
  },
};
