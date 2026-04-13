import { ArrowRight } from "lucide-react";

import type { Workflow } from "@/types/api/domain";

import { Button } from "@/components/ui/button";

import { StatusPill } from "./status-pill";

export function WorkflowTable({ workflows }: { workflows: Workflow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-[0.06em] text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Workflow</th>
            <th className="px-4 py-3">Estágio atual</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Ação</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr key={workflow.id} className="border-t">
              <td className="px-4 py-3">
                <p className="font-medium">{workflow.name}</p>
                <p className="text-xs text-muted-foreground">{workflow.description}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{workflow.currentStage ?? 1}</td>
              <td className="px-4 py-3">
                <StatusPill status={workflow.status} />
              </td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" className="gap-2">
                  Abrir
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
