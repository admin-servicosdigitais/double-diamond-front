"use client";

import { useEffect } from "react";

import { AlertBanner } from "@/components/system";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <AlertBanner
        tone="warning"
        title="Não foi possível carregar esta página"
        description="Tente novamente. Se o problema persistir, valide conectividade da API e permissões da sessão."
      />
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
