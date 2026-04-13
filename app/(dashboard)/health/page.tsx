import { PageScaffold } from "@/components/layout/page-scaffold";

export default function HealthPage() {
  return (
    <PageScaffold
      section="System Health"
      title="Saúde do sistema"
      description="Monitore disponibilidade da API, filas e integrações críticas em um único painel."
      primaryAction={{ label: "Abrir incidentes", href: "/health" }}
      availableActions={[
        "Verificar status por serviço",
        "Acompanhar incidentes ativos",
        "Priorizar mitigação por impacto",
      ]}
      pendingItems={[
        "Conectar heartbeat dos serviços",
        "Adicionar histórico de uptime",
        "Criar playbooks automáticos de resposta",
      ]}
    />
  );
}
