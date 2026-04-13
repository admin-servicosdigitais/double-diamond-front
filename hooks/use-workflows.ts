"use client";

import { useWorkflowsQuery } from "@/hooks/api/use-domain-api";

export function useWorkflows() {
  return useWorkflowsQuery();
}
