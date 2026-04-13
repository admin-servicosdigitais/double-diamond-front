import { apiRequest } from "@/services/api/client";
import type { Agent, ApiListResponse } from "@/types/api/domain";

export const agentsService = {
  list: () => apiRequest<ApiListResponse<Agent> | Agent[]>("/agents"),
  getById: (agentId: string) => apiRequest<Agent>(`/agents/${agentId}`),
};
