"use client";

import { Activity, CheckCircle2, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWorkflows } from "@/hooks/use-workflows";

import { QuickWorkflowForm } from "./quick-workflow-form";

const statusCards = [
  { label: "Fluxos ativos", value: "12", icon: Activity },
  { label: "Aguardando aprovação", value: "5", icon: Clock3 },
  { label: "Concluídos hoje", value: "7", icon: CheckCircle2 },
];

export function DashboardOverview() {
  const { data, isLoading } = useWorkflows();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI First Command Center
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">Controle total com aprovação humana</h2>
          <p className="text-sm text-muted-foreground">Visão consolidada de execução, revisão de artefatos e avanço entre estágios.</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {statusCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <CardDescription>{label}</CardDescription>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workflows em andamento</CardTitle>
            <CardDescription>Dados consumidos por TanStack Query via camada de serviços centralizada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <p className="text-sm text-muted-foreground">Carregando workflows...</p>}
            {data?.data.map((workflow) => (
              <div key={workflow.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{workflow.name}</p>
                  <Badge variant="outline">{workflow.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">Estágios: {workflow.stages.length}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <QuickWorkflowForm />
      </section>
    </div>
  );
}
