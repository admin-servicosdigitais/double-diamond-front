"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { agentsService } from "@/services/api/agents-service";
import { getErrorMessage } from "@/services/api/client";
import { healthService } from "@/services/api/health-service";
import { workflowsService } from "@/services/api/workflows-service";
import type { PatchArtifactPayload, Stage } from "@/types/api/domain";

export const domainQueryKeys = {
  health: ["health"] as const,
  agents: ["agents"] as const,
  agent: (agentId: string) => ["agents", agentId] as const,
  workflows: ["workflows"] as const,
  workflow: (workflowId: string) => ["workflows", workflowId] as const,
  stage: (workflowId: string, stage: number | string) => ["workflows", workflowId, "stages", stage] as const,
  stageOutputs: (workflowId: string, stage: number | string) => ["workflows", workflowId, "stages", stage, "outputs"] as const,
  latestAgentOutput: (workflowId: string, agentCode: string) =>
    ["workflows", workflowId, "agents", agentCode, "latest-output"] as const,
  artifact: (workflowId: string, stage: number | string, artifactName: string) =>
    ["workflows", workflowId, "stages", stage, "outputs", artifactName] as const,
};

function normalizeListResponse<T>(payload: { items: T[] } | T[]): T[] {
  return Array.isArray(payload) ? payload : payload.items;
}

const DEFAULT_QUERY_STALE_TIME = 30_000;

export function useHealthQuery() {
  return useQuery({ queryKey: domainQueryKeys.health, queryFn: healthService.get, staleTime: DEFAULT_QUERY_STALE_TIME });
}

export function useAgentsQuery() {
  return useQuery({
    queryKey: domainQueryKeys.agents,
    queryFn: async () => normalizeListResponse(await agentsService.list()),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useAgentQuery(agentId: string) {
  return useQuery({
    queryKey: domainQueryKeys.agent(agentId),
    queryFn: () => agentsService.getById(agentId),
    enabled: Boolean(agentId),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useWorkflowsQuery() {
  return useQuery({
    queryKey: domainQueryKeys.workflows,
    queryFn: async () => normalizeListResponse(await workflowsService.list()),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}


export function useCreateWorkflowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workflowsService.create,
    onSuccess: (createdWorkflow) => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.workflows });
      queryClient.setQueryData(domainQueryKeys.workflow(createdWorkflow.id), createdWorkflow);
    },
    retry: 0,
    meta: { friendlyError: getErrorMessage },
  });
}
export function useWorkflowQuery(workflowId: string) {
  return useQuery({
    queryKey: domainQueryKeys.workflow(workflowId),
    queryFn: () => workflowsService.getById(workflowId),
    enabled: Boolean(workflowId),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useStageQuery(workflowId: string, stage: number | string) {
  return useQuery({
    queryKey: domainQueryKeys.stage(workflowId, stage),
    queryFn: () => workflowsService.getStage(workflowId, stage),
    enabled: Boolean(workflowId && stage),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useStageOutputsQuery(workflowId: string, stage: number | string) {
  return useQuery({
    queryKey: domainQueryKeys.stageOutputs(workflowId, stage),
    queryFn: async () => normalizeListResponse(await workflowsService.getStageOutputs(workflowId, stage)),
    enabled: Boolean(workflowId && stage),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useLatestAgentOutputQuery(workflowId: string, agentCode: string) {
  return useQuery({
    queryKey: domainQueryKeys.latestAgentOutput(workflowId, agentCode),
    queryFn: () => workflowsService.getLatestAgentOutput(workflowId, agentCode),
    enabled: Boolean(workflowId && agentCode),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

export function useArtifactQuery(workflowId: string, stage: number | string, artifactName: string) {
  return useQuery({
    queryKey: domainQueryKeys.artifact(workflowId, stage, artifactName),
    queryFn: () => workflowsService.getArtifact(workflowId, stage, artifactName),
    enabled: Boolean(workflowId && stage && artifactName),
    staleTime: DEFAULT_QUERY_STALE_TIME,
  });
}

function invalidateWorkflowGraph(queryClient: ReturnType<typeof useQueryClient>, workflowId: string, stage: number | string) {
  queryClient.invalidateQueries({ queryKey: domainQueryKeys.workflows });
  queryClient.invalidateQueries({ queryKey: domainQueryKeys.workflow(workflowId) });
  queryClient.invalidateQueries({ queryKey: domainQueryKeys.stage(workflowId, stage) });
  queryClient.invalidateQueries({ queryKey: domainQueryKeys.stageOutputs(workflowId, stage) });
}

export function useRunStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, stage }: { workflowId: string; stage: number | string }) => workflowsService.runStage(workflowId, stage),
    onSuccess: (_, vars) => invalidateWorkflowGraph(queryClient, vars.workflowId, vars.stage),
    retry: 0,
    meta: { friendlyError: getErrorMessage },
  });
}

export function useApproveStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, stage }: { workflowId: string; stage: number | string }) =>
      workflowsService.approveStage(workflowId, stage),
    onSuccess: (_, vars) => invalidateWorkflowGraph(queryClient, vars.workflowId, vars.stage),
    retry: 0,
    meta: { friendlyError: getErrorMessage },
  });
}

export function useNextStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, stage, currentStage }: { workflowId: string; stage: number | string; currentStage?: Stage }) => {
      if (currentStage?.status && currentStage.status !== "approved") {
        throw new Error("O estágio atual precisa estar aprovado antes de avançar.");
      }

      return workflowsService.nextStage(workflowId, stage);
    },
    onSuccess: (_, vars) => invalidateWorkflowGraph(queryClient, vars.workflowId, vars.stage),
    retry: 0,
    meta: { friendlyError: getErrorMessage },
  });
}

export function usePatchArtifactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      stage,
      artifactName,
      payload,
    }: {
      workflowId: string;
      stage: number | string;
      artifactName: string;
      payload: PatchArtifactPayload;
    }) => workflowsService.patchArtifact(workflowId, stage, artifactName, payload),
    onSuccess: (_artifact, vars) => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.artifact(vars.workflowId, vars.stage, vars.artifactName) });
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.stageOutputs(vars.workflowId, vars.stage) });
    },
    retry: 0,
    meta: { friendlyError: getErrorMessage },
  });
}
