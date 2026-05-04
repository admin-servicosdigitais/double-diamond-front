"use client";

import { useMemo, useState } from "react";

import { Workflow } from "lucide-react";

import { EmptyState, PremiumTableSkeleton, UXStateCard, WorkflowTable } from "@/components/system";
import { useWorkflowsQuery } from "@/hooks/api/use-domain-queries";
import { getNextActionLabel } from "@/lib/workflow/display";
import type { WorkflowStatus } from "@/types/api/domain";

import { WorkflowsFilters } from "./workflows-filters";

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function WorkflowsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus | "all">("all");
  const workflowsQuery = useWorkflowsQuery();

  const filteredWorkflows = useMemo(() => {
    const workflows = workflowsQuery.data ?? [];
    const normalizedSearch = normalizeSearchValue(searchTerm);

    return workflows.filter((workflow) => {
      const matchesStatus = selectedStatus === "all" || workflow.status === selectedStatus;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      const fields = [workflow.name, workflow.id, workflow.description, getNextActionLabel(workflow)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return fields.includes(normalizedSearch);
    });
  }, [workflowsQuery.data, searchTerm, selectedStatus]);

  return (
    <div className="space-y-6">
      <WorkflowsFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {workflowsQuery.isLoading ? (
        <PremiumTableSkeleton rows={5} />
      ) : workflowsQuery.isError ? (
        <UXStateCard
          kind="error"
          title="Não conseguimos carregar os workflows"
          description="Recarregue para restaurar a fila de execução e as prioridades do dia."
          actionLabel="Recarregar"
          onAction={() => workflowsQuery.refetch()}
        />
      ) : filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="Nenhum workflow corresponde aos filtros"
          description="Refine os filtros ou crie um novo workflow para começar."
          actionLabel="Limpar filtros"
          onAction={() => {
            setSearchTerm("");
            setSelectedStatus("all");
          }}
        />
      ) : (
        <WorkflowTable workflows={filteredWorkflows} />
      )}
    </div>
  );
}
