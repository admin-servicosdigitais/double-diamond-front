"use client";

import { Bell, CheckCircle2, PanelLeft, TriangleAlert, WifiOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SystemBreadcrumb } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { useHealthQuery } from "@/hooks/api/use-domain-api";
import { cn } from "@/lib/utils";
import { getRouteContext } from "@/lib/navigation";
import { useUiStore } from "@/store/ui-store";
import type { HealthStatus } from "@/types/api/domain";

function formatDateTime(date?: string) {
  if (!date) return "sem horário";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "sem horário";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getApiIndicator(status?: HealthStatus) {
  if (status === "ok") {
    return {
      label: "API estável",
      icon: CheckCircle2,
      className: "text-emerald-700 border-emerald-200 bg-emerald-50",
      dotClassName: "bg-emerald-500",
      summary: "Operação normal no momento.",
    };
  }

  if (status === "degraded") {
    return {
      label: "API instável",
      icon: TriangleAlert,
      className: "text-amber-700 border-amber-200 bg-amber-50",
      dotClassName: "bg-amber-500",
      summary: "Oscilações pontuais detectadas.",
    };
  }

  return {
    label: "API indisponível",
    icon: WifiOff,
    className: "text-rose-700 border-rose-200 bg-rose-50",
    dotClassName: "bg-rose-500",
    summary: "Não foi possível confirmar disponibilidade.",
  };
}

export function AppHeader() {
  const pathname = usePathname();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const healthQuery = useHealthQuery();
  const { title, breadcrumbs, actions } = getRouteContext(pathname);

  const indicator = getApiIndicator(healthQuery.data?.status);
  const IndicatorIcon = indicator.icon;

  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur-lg">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label="Alternar barra lateral">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 space-y-1">
            <SystemBreadcrumb items={breadcrumbs} />
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="group relative hidden md:block">
            <Link href="/health">
              <Badge variant="outline" className={cn("cursor-pointer items-center gap-1.5 border text-xs", indicator.className)}>
                <span className={cn("h-2 w-2 rounded-full", indicator.dotClassName)} aria-hidden />
                <IndicatorIcon className="h-3.5 w-3.5" />
                {indicator.label}
              </Badge>
            </Link>

            <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] w-64 rounded-lg border bg-background p-3 text-xs text-muted-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              <p className="font-medium text-foreground">Saúde da API</p>
              <p className="mt-1">{indicator.summary}</p>
              <p className="mt-1">Última checagem: {formatDateTime(healthQuery.data?.timestamp)}</p>
              <p className="mt-2 text-[11px]">Clique para ver detalhes na página de health.</p>
            </div>
          </div>

          {actions.slice(0, 2).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(buttonVariants({ variant: action.variant ?? "default", size: "sm" }), "hidden xl:inline-flex")}
            >
              {action.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
