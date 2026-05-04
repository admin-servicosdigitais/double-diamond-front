"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import type { WorkflowStatus } from "@/types/api/domain";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { statusConfig } from "@/components/system/status-config";
import { cn } from "@/lib/utils";

const PRIMARY_STATUSES: WorkflowStatus[] = ["running", "awaiting_human_approval", "blocked"];
const SECONDARY_STATUSES: WorkflowStatus[] = ["error", "approved", "completed", "not_started"];

type WorkflowsFiltersProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatus: WorkflowStatus | "all";
  onStatusChange: (status: WorkflowStatus | "all") => void;
};

function StatusChip({
  status,
  selected,
  onClick,
}: {
  status: WorkflowStatus;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        selected ? "border-transparent bg-foreground text-background" : statusConfig[status].tone,
      )}
    >
      {statusConfig[status].label}
    </button>
  );
}

export function WorkflowsFilters({
  searchTerm,
  onSearchTermChange,
  selectedStatus,
  onStatusChange,
}: WorkflowsFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-3">
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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onStatusChange("all")}
          className="h-8 rounded-full"
        >
          Todos
        </Button>
        {PRIMARY_STATUSES.map((status) => (
          <StatusChip
            key={status}
            status={status}
            selected={selectedStatus === status}
            onClick={() => onStatusChange(status)}
          />
        ))}

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="contents">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Filtros avançados
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex w-full flex-wrap items-center gap-2 pt-1">
            {SECONDARY_STATUSES.map((status) => (
              <StatusChip
                key={status}
                status={status}
                selected={selectedStatus === status}
                onClick={() => onStatusChange(status)}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
