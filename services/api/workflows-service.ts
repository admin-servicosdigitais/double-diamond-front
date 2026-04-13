import { apiRequest } from "@/services/api/client";
import type { PaginatedResponse, Workflow } from "@/types/api/workflow";

export const workflowsService = {
  list: () => apiRequest<PaginatedResponse<Workflow>>("/workflows"),
  getById: (id: string) => apiRequest<Workflow>(`/workflows/${id}`),
};
