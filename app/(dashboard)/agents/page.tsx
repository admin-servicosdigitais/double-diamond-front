import { PageScaffold } from "@/components/layout/page-scaffold";

export default function AgentsPage() {
  return (
    <PageScaffold
      section="Agents"
      title="Catálogo de agents"
      description="Gerencie capacidades, versões e responsabilidades dos agents da operação."
      primaryAction={{ label: "Registrar agent", href: "/agents/a-001" }}
      availableActions={[
        "Abrir perfil completo de cada agent",
        "Comparar disponibilidade entre agents",
        "Definir políticas de fallback",
      ]}
      pendingItems={[
        "Conectar inventário real de agents",
        "Adicionar histórico de versões",
        "Implementar score de confiabilidade",
      ]}
    />
  );
}
