import { PageScaffold } from "@/components/layout/page-scaffold";

export default function AgentDetailsPage({ params }: { params: { agentId: string } }) {
  return (
    <PageScaffold
      section="Agents"
      title={`Perfil do agent ${params.agentId}`}
      description="Detalhes de configuração, saúde e uso do agent no ecossistema."
      primaryAction={{ label: "Voltar para Agents", href: "/agents" }}
      availableActions={[
        "Inspecionar capacidades e limites",
        "Ver workflows vinculados",
        "Monitorar latência e taxa de erro",
      ]}
      pendingItems={[
        "Conectar métricas em tempo real",
        "Adicionar edição de parâmetros",
        "Implementar trilha de mudanças",
      ]}
    />
  );
}
