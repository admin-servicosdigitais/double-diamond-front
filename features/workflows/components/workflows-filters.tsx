import { Search } from "lucide-react";

import type { WorkflowStatus } from "@/types/api/domain";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { statusConfig } from "@/components/system/status-config";
import { cn } from "@/lib/utils";

const statusOrder: WorkflowStatus[] = [
  "running",
  "awaiting_human_approval",
  "blocked",
  "error",
  "approved",
  "completed",
  "not_started",
];

type WorkflowsFiltersProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatus: WorkflowStatus | "all";
  onStatusChange: (status: WorkflowStatus | "all") => void;
};

export function WorkflowsFilters({
  searchTerm,
  onSearchTermChange,
  selectedStatus,
  onStatusChange,
}: WorkflowsFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="pl-9"
          placeholder="Buscar por nome, ID ou próxima ação"
          aria-label="Buscar workflows"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange("all")}
          className="rounded-full"
        >
          Todos
        </Button>
        {statusOrder.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatusChange(status)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selectedStatus === status ? "border-transparent bg-foreground text-background" : statusConfig[status].tone,
            )}
          >
            {statusConfig[status].label}
          </button>
        ))}
      </div>
    </div>
  );
}
