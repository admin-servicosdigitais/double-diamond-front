import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { Workflow } from "@/types/api/domain";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCurrentStageLabel, formatWorkflowDate } from "@/lib/workflow/display";

import { StatusPill } from "./status-pill";

type WorkflowTableProps = {
  workflows: Workflow[];
};

export function WorkflowTable({ workflows }: WorkflowTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Estágio atual</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Atualizado</th>
            <th className="px-4 py-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {workflows.map((workflow) => (
            <tr key={workflow.id} className="align-top transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{workflow.name}</p>
                <p className="text-xs text-muted-foreground">{workflow.id}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{getCurrentStageLabel(workflow)}</td>
              <td className="px-4 py-3">
                <StatusPill status={workflow.status} showIcon={false} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{formatWorkflowDate(workflow.updatedAt ?? workflow.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/workflows/${workflow.id}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5")}
                >
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
