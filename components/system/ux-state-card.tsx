import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Ban, Clock3, Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SystemSkeleton } from "./system-skeleton";

type UXStateTone = "neutral" | "error" | "blocked" | "approval";

type UXStateKind = "empty" | "error" | "blocked" | "awaiting_human_approval";

type UXStateConfig = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  tone: UXStateTone;
};

const toneStyles: Record<UXStateTone, string> = {
  neutral: "border-border/80 bg-muted/30",
  error: "border-rose-300 bg-rose-50/90",
  blocked: "border-orange-300 bg-orange-50/90",
  approval: "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-100/80 ring-2 ring-amber-300/50",
};

const defaultStateConfig: Record<UXStateKind, UXStateConfig> = {
  empty: {
    icon: Database,
    eyebrow: "Sem conteúdo ainda",
    title: "Ainda não há dados para exibir",
    description: "Assim que novas execuções entrarem no fluxo, este espaço trará contexto, métricas e próximos passos recomendados.",
    actionLabel: "Atualizar visão",
    tone: "neutral",
  },
  error: {
    icon: AlertTriangle,
    eyebrow: "Falha temporária",
    title: "Não conseguimos carregar esta experiência",
    description: "Nosso time já foi sinalizado. Tente novamente em instantes para restaurar a visão operacional completa.",
    actionLabel: "Tentar novamente",
    tone: "error",
  },
  blocked: {
    icon: Ban,
    eyebrow: "Fluxo bloqueado",
    title: "Existe um impedimento que pausa o avanço",
    description: "Regularize as dependências pendentes e retome a execução. Se necessário, volte ao estágio anterior para destravar o processo.",
    actionLabel: "Ver próxima ação",
    tone: "blocked",
  },
  awaiting_human_approval: {
    icon: Clock3,
    eyebrow: "Ação humana obrigatória",
    title: "Aguardando aprovação para continuar",
    description: "Este ponto exige validação humana explícita para proteger qualidade, compliance e segurança de decisão.",
    actionLabel: "Abrir aprovação",
    tone: "approval",
  },
};

type UXStateCardProps = {
  kind: UXStateKind;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function UXStateCard({ kind, title, description, actionLabel, onAction, className }: UXStateCardProps) {
  const config = defaultStateConfig[kind];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl border px-6 py-8 text-center shadow-sm", toneStyles[config.tone], className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background/90">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{config.eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold">{title ?? config.title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description ?? config.description}</p>
      {(actionLabel ?? config.actionLabel) ? (
        <Button className="mt-5" variant={kind === "awaiting_human_approval" ? "default" : "secondary"} onClick={onAction}>
          {actionLabel ?? config.actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function PremiumPageSkeleton() {
  return (
    <div className="space-y-5">
      <SystemSkeleton className="h-7 w-64 rounded-lg" />
      <SystemSkeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <SystemSkeleton className="h-40 w-full rounded-xl" />
        <SystemSkeleton className="h-40 w-full rounded-xl" />
      </div>
      <SystemSkeleton className="h-52 w-full rounded-xl" />
    </div>
  );
}

export function PremiumTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <SystemSkeleton className="h-5 w-48" />
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg border p-3">
          <SystemSkeleton className="h-4 w-2/5" />
          <SystemSkeleton className="mt-2 h-3 w-4/5" />
          <SystemSkeleton className="mt-3 h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

