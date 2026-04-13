import { Check, Pause, Play, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StageActionToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
      <Button className="gap-2">
        <Play className="h-4 w-4" />
        Executar
      </Button>
      <Button variant="secondary" className="gap-2">
        <Check className="h-4 w-4" />
        Aprovar
      </Button>
      <Button variant="outline" className="gap-2">
        <Pause className="h-4 w-4" />
        Pausar
      </Button>
      <Button variant="ghost" className="gap-2">
        <SkipForward className="h-4 w-4" />
        Próximo estágio
      </Button>
    </div>
  );
}
