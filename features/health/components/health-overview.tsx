"use client";

import { CheckCircle2, RefreshCw, ServerCrash, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHealthQuery } from "@/hooks/api/use-domain-queries";
import { cn } from "@/lib/utils";
import { formatDateTimeLabel } from "@/lib/workflow/display";
import type { HealthStatus } from "@/types/api/domain";

function getStatusContent(status?: HealthStatus) {
  if (status === "ok") {
    return {
      label: "API operando normalmente",
      description: "Todos os sinais indicam estabilidade.",
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }
  if (status === "degraded") {
    return {
      label: "Degradação leve",
      description: "Há instabilidade pontual. Continue operando, mas vale acompanhar.",
      tone: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      icon: TriangleAlert,
    };
  }
  return {
    label: "API indisponível",
    description: "Não conseguimos confirmar a saúde do backend.",
    tone: "border-rose-200 bg-rose-50 text-rose-800",
    dot: "bg-rose-500",
    icon: ServerCrash,
  };
}

export function HealthOverview() {
  const healthQuery = useHealthQuery();
  const healthStatus = healthQuery.data?.status;
  const statusContent = getStatusContent(healthStatus);
  const dependencies = Object.entries(healthQuery.data?.dependencies ?? {});
  const Icon = statusContent.icon;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Status simples para monitorar o backend sem ruído.</p>
      </header>

      <section className={cn("flex items-start gap-4 rounded-xl border p-5", statusContent.tone)}>
        <Icon className="h-6 w-6 shrink-0" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">{statusContent.label}</p>
          <p className="text-xs">{statusContent.description}</p>
          <p className="text-xs opacity-75">Última checagem: {formatDateTimeLabel(healthQuery.data?.timestamp)}</p>
        </div>
        <Button
          onClick={() => healthQuery.refetch()}
          disabled={healthQuery.isFetching}
          variant="outline"
          size="sm"
          className="gap-1.5 bg-background/70"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", healthQuery.isFetching && "animate-spin")} />
          Revalidar
        </Button>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="surface-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Serviço</p>
          <p className="mt-1 text-sm font-medium text-foreground">{healthQuery.data?.service ?? "API principal"}</p>
        </div>
        <div className="surface-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Versão</p>
          <p className="mt-1 text-sm font-medium text-foreground">{healthQuery.data?.version ?? "n/d"}</p>
        </div>
        <div className="surface-soft">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dependências</p>
          <p className="mt-1 text-sm font-medium text-foreground">{dependencies.length}</p>
        </div>
      </section>

      {dependencies.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">Dependências</h2>
          <ul className="divide-y divide-border/50 rounded-lg border border-border/60">
            {dependencies.map(([name, status]) => (
              <li key={name} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{String(status)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
