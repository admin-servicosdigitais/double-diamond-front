import { apiRequest } from "@/services/api/client";
import { normalizeAgent } from "@/services/api/adapters";
import type { Agent, ApiListResponse } from "@/types/api/domain";

export const agentsService = {
  async list(): Promise<ApiListResponse<Agent> | Agent[]> {
    const response = await apiRequest<unknown>("/agents");
    if (Array.isArray(response)) {
      return response.map(normalizeAgent);
    }

    return { items: [] };
  },

  async getById(agentId: string): Promise<Agent> {
    const response = await apiRequest<unknown>(`/agents/${agentId}`);
    return normalizeAgent(response);
  },
};
