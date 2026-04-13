"use client";

import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, ServerCrash } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealthQuery } from "@/hooks/api/use-domain-api";
import { cn } from "@/lib/utils";
import type { HealthStatus } from "@/types/api/domain";

function formatDateTime(date?: string) {
  if (!date) return "Sem atualização";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sem atualização";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getStatusContent(status?: HealthStatus) {
  if (status === "ok") {
    return {
      label: "API operando normalmente",
      description: "Todos os sinais indicam estabilidade. Você pode seguir com as operações com tranquilidade.",
      badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dotClassName: "bg-emerald-500",
      icon: CheckCircle2,
    };
  }

  if (status === "degraded") {
    return {
      label: "API com degradação leve",
      description: "Há instabilidade pontual. Continue operando, mas vale acompanhar novas checagens.",
      badgeClassName: "border-amber-200 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
      icon: AlertTriangle,
    };
  }

  return {
    label: "API indisponível no momento",
    description: "Não conseguimos confirmar a saúde do backend agora. Revalide para tentar novamente.",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
    icon: ServerCrash,
  };
}

export default function HealthPage() {
  const healthQuery = useHealthQuery();
  const healthStatus = healthQuery.data?.status;
  const statusContent = getStatusContent(healthStatus);
  const dependencies = Object.entries(healthQuery.data?.dependencies ?? {});
  const Icon = statusContent.icon;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="space-y-2">
        <Badge variant="secondary" className="w-fit gap-2">
          <Activity className="h-3.5 w-3.5" />
          Saúde operacional
        </Badge>
        <h1>Health da API</h1>
        <p className="text-sm text-muted-foreground">Visão simples e confiável para monitorar o backend sem ruído técnico.</p>
      </section>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-xl">Status atual do backend</CardTitle>
              <CardDescription>{statusContent.description}</CardDescription>
            </div>
            <Badge className={cn("gap-2 border", statusContent.badgeClassName)}>
              <span className={cn("h-2 w-2 rounded-full", statusContent.dotClassName)} aria-hidden />
              {statusContent.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Serviço</p>
              <p className="mt-1 text-sm font-medium">{healthQuery.data?.service ?? "API principal"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Versão</p>
              <p className="mt-1 text-sm font-medium">{healthQuery.data?.version ?? "n/d"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Última checagem</p>
              <p className="mt-1 flex items-center gap-1 text-sm font-medium">
                <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                {formatDateTime(healthQuery.data?.timestamp)}
              </p>
            </div>
          </div>

          {dependencies.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Resumo das dependências</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {dependencies.map(([name, status]) => (
                  <div key={name} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{name}:</span> {String(status)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed p-3">
            <p className="text-sm text-muted-foreground">{healthQuery.isFetching ? "Revalidando status da API..." : "Se precisar, atualize o status agora."}</p>
            <Button onClick={() => healthQuery.refetch()} disabled={healthQuery.isFetching} className="gap-2">
              <RefreshCw className={cn("h-4 w-4", healthQuery.isFetching && "animate-spin")} />
              Revalidar
            </Button>
          </div>

          {healthQuery.isError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Não foi possível carregar o health neste momento. Tente novamente em instantes.
            </p>
          )}

          {healthQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Carregando status do backend...</p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon className="h-4 w-4" />
            Indicador pensado para confiança operacional: útil, discreto e elegante.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
