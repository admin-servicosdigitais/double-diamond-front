"use client";

import { useEffect } from "react";

import { UXStateCard } from "@/components/system";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <UXStateCard
      kind="error"
      title="A experiência do dashboard ficou temporariamente indisponível"
      description="Já registramos o incidente. Tente novamente para recuperar métricas, filas e próximos passos da operação."
      actionLabel="Recarregar dashboard"
      onAction={reset}
    />
  );
}
