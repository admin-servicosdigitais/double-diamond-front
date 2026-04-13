import { apiRequest } from "@/services/api/client";
import { normalizeHealth } from "@/services/api/adapters";
import type { Health } from "@/types/api/domain";

export const healthService = {
  async get(): Promise<Health> {
    const response = await apiRequest<unknown>("/health");
    return normalizeHealth(response);
  },
};
