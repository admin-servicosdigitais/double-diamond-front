import { AlertCircle, Ban, CheckCircle2, CircleDot, Clock3, LoaderCircle, PauseCircle } from "lucide-react";

import type { StageStatus } from "@/types/api/domain";

export const statusConfig: Record<
  StageStatus,
  {
    label: string;
    tone: string;
    dot: string;
    icon: typeof CircleDot;
  }
> = {
  not_started: {
    label: "Não iniciado",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: PauseCircle,
  },
  running: {
    label: "Em execução",
    tone: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
    icon: LoaderCircle,
  },
  awaiting_human_approval: {
    label: "Aguardando aprovação",
    tone: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-950 border-amber-300 shadow-[0_0_0_1px_rgba(251,191,36,0.4)]",
    dot: "bg-amber-600",
    icon: Clock3,
  },
  approved: {
    label: "Aprovado",
    tone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  blocked: {
    label: "Bloqueado",
    tone: "bg-orange-100 text-orange-900 border-orange-300",
    dot: "bg-orange-600",
    icon: Ban,
  },
  completed: {
    label: "Concluído",
    tone: "bg-teal-100 text-teal-800 border-teal-200",
    dot: "bg-teal-500",
    icon: CircleDot,
  },
  error: {
    label: "Erro",
    tone: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    icon: AlertCircle,
  },
};
