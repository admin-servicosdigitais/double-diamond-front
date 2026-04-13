"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { AlertCircle, Plus, Workflow } from "lucide-react";

import { EmptyState, PremiumTableSkeleton, UXStateCard, WorkflowTable } from "@/components/system";
import { Button } from "@/components/ui/button";
import { useWorkflows } from "@/hooks/use-workflows";
import { getNextActionLabel } from "@/lib/workflow/display";
import type { WorkflowStatus } from "@/types/api/domain";

import { WorkflowsFilters } from "./workflows-filters";

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function WorkflowsOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus | "all">("all");
  const workflowsQuery = useWorkflows();

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
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1>Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Visualize, filtre e abra workflows rapidamente para manter o fluxo operacional em dia.
          </p>
        </div>

        <Link href="/workflows/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo workflow
          </Button>
        </Link>
      </section>

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
          title="Não conseguimos carregar seus workflows agora"
          description="Parece uma oscilação momentânea. Recarregue para restaurar a fila de execução e as prioridades do dia."
          actionLabel="Recarregar workflows"
          onAction={() => workflowsQuery.refetch()}
        />
      ) : filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="Nenhum workflow corresponde aos filtros atuais"
          description="Refine os filtros para localizar um fluxo existente ou crie um novo workflow para começar a operar."
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
