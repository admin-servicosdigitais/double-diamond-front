import { FileText, History, Lightbulb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContextPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Painel contextual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p>Sugestão de melhoria: consolidar evidências antes da aprovação final.</p>
        </div>
        <div className="flex gap-2">
          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p>3 artefatos gerados no estágio atual aguardando revisão humana.</p>
        </div>
        <div className="flex gap-2">
          <History className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <p>Última decisão registrada há 14 minutos por Ana Martins.</p>
        </div>
      </CardContent>
    </Card>
  );
}
