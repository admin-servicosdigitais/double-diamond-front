import { PageScaffold } from "@/components/layout/page-scaffold";

export default function StageDetailsPage({ params }: { params: { workflowId: string; stageId: string } }) {
  return (
    <PageScaffold
      section={`Workflow ${params.workflowId}`}
      title={`Estágio ${params.stageId}`}
      description="Visão de contexto, critérios de aprovação e estado do estágio atual."
      primaryAction={{ label: "Ver outputs", href: `/workflows/${params.workflowId}/stages/${params.stageId}/outputs` }}
      availableActions={[
        "Revisar instruções recebidas",
        "Aprovar ou solicitar ajustes",
        "Navegar para artefatos produzidos",
      ]}
      pendingItems={[
        "Conectar checklist de revisão",
        "Adicionar diff entre versões de saída",
        "Habilitar comentários em linha",
      ]}
    />
  );
}
