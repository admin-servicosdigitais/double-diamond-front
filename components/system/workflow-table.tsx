import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { Workflow } from "@/types/api/domain";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCurrentStageLabel, getNextActionLabel, formatWorkflowDate } from "@/lib/workflow/display";

import { StatusPill } from "./status-pill";

type WorkflowTableProps = {
  workflows: Workflow[];
};

export function WorkflowTable({ workflows }: WorkflowTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-[0.06em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Workflow ID</th>
            <th className="px-4 py-3">Estágio atual</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Última atualização</th>
            <th className="px-4 py-3">Próxima ação</th>
            <th className="px-4 py-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr key={workflow.id} className="border-t align-top transition-colors hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{workflow.name}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{workflow.id}</td>
              <td className="px-4 py-3 text-muted-foreground">{getCurrentStageLabel(workflow)}</td>
              <td className="px-4 py-3">
                <StatusPill status={workflow.status} showIcon={false} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatWorkflowDate(workflow.updatedAt ?? workflow.createdAt)}</td>
              <td className="px-4 py-3 text-muted-foreground">{getNextActionLabel(workflow)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/workflows/${workflow.id}`}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
                >
                  Abrir workflow
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
