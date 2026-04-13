import { PageScaffold } from "@/components/layout/page-scaffold";

export default function ArtifactDetailsPage({
  params,
}: {
  params: { workflowId: string; stageId: string; artifactName: string };
}) {
  return (
    <PageScaffold
      section={`Workflow ${params.workflowId}`}
      title={`Artefato: ${decodeURIComponent(params.artifactName)}`}
      description="Visualização detalhada do artefato com contexto operacional e status de revisão."
      primaryAction={{ label: "Voltar aos outputs", href: `/workflows/${params.workflowId}/stages/${params.stageId}/outputs` }}
      availableActions={[
        "Ler o conteúdo completo do artefato",
        "Marcar revisão como concluída",
        "Enviar feedback para o próximo ciclo",
      ]}
      pendingItems={[
        "Implementar viewer por tipo de arquivo",
        "Adicionar trilha de comentários",
        "Habilitar assinatura digital da aprovação",
      ]}
    />
  );
}
