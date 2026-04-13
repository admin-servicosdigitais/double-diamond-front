import { apiRequest } from "@/services/api/client";
import type { Health } from "@/types/api/domain";

export const healthService = {
  get: () => apiRequest<Health>("/health"),
};
