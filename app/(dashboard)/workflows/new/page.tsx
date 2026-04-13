import { PageScaffold } from "@/components/layout/page-scaffold";

export default function NewWorkflowPage() {
  return (
    <PageScaffold
      section="Workflows"
      title="Novo workflow"
      description="Configure o fluxo inicial, responsáveis e políticas de aprovação antes da execução."
      primaryAction={{ label: "Salvar rascunho", href: "/workflows" }}
      availableActions={[
        "Definir nome, objetivo e prioridade do workflow",
        "Escolher template inicial de estágios",
        "Configurar aprovação humana obrigatória",
      ]}
      pendingItems={[
        "Adicionar validação de formulário",
        "Conectar criação via API",
        "Implementar duplicação de templates existentes",
      ]}
    />
  );
}
