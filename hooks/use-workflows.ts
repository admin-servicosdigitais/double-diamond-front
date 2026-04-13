"use client";

import { useQuery } from "@tanstack/react-query";

import { workflowsPlaceholder } from "@/mocks/workflows";
import { workflowsService } from "@/services/api/workflows-service";

export function useWorkflows() {
  return useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      try {
        return await workflowsService.list();
      } catch {
        return {
          data: workflowsPlaceholder,
          total: workflowsPlaceholder.length,
          page: 1,
          pageSize: workflowsPlaceholder.length,
        };
      }
    },
  });
}
