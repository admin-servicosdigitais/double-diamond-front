import { PageScaffold } from "@/components/layout/page-scaffold";

export default function StageOutputsPage({ params }: { params: { workflowId: string; stageId: string } }) {
  return (
    <PageScaffold
      section={`Workflow ${params.workflowId}`}
      title={`Outputs do estágio ${params.stageId}`}
      description="Catálogo de artefatos gerados com rastreabilidade por execução."
      primaryAction={{
        label: "Abrir artefato exemplo",
        href: `/workflows/${params.workflowId}/stages/${params.stageId}/outputs/report.md`,
      }}
      availableActions={[
        "Comparar outputs por versão",
        "Validar artefato antes da aprovação",
        "Baixar ou compartilhar resultados",
      ]}
      pendingItems={[
        "Conectar pré-visualização de arquivos",
        "Adicionar filtros por tipo de artefato",
        "Exibir checksum e origem de geração",
      ]}
    />
  );
}
