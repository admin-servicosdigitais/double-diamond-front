import { PageScaffold } from "@/components/layout/page-scaffold";

export default function WorkflowDetailsPage({ params }: { params: { workflowId: string } }) {
  return (
    <PageScaffold
      section={`Workflow ${params.workflowId}`}
      title={`Detalhes do workflow ${params.workflowId}`}
      description="Entenda progresso por estágio, decisões humanas e histórico operacional."
      primaryAction={{ label: "Abrir estágio", href: `/workflows/${params.workflowId}/stages/1` }}
      availableActions={[
        "Inspecionar estágios em andamento",
        "Aplicar ações de aprovação ou rejeição",
        "Acessar outputs por estágio",
      ]}
      pendingItems={[
        "Conectar timeline de eventos",
        "Exibir responsáveis por decisão",
        "Adicionar logs de auditoria exportáveis",
      ]}
    />
  );
}
