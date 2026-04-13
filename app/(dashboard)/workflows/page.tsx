import { PageScaffold } from "@/components/layout/page-scaffold";

export default function WorkflowsPage() {
  return (
    <PageScaffold
      section="Workflows"
      title="Visão geral dos workflows"
      description="Acompanhe execução, aprovações humanas e gargalos operacionais de ponta a ponta."
      primaryAction={{ label: "Criar workflow", href: "/workflows/new" }}
      availableActions={[
        "Filtrar workflows por status e prioridade",
        "Entrar no detalhe de um workflow para revisar estágios",
        "Navegar para outputs gerados por cada estágio",
      ]}
      pendingItems={[
        "Conectar listagem ao backend com paginação",
        "Definir métricas de SLA por tipo de workflow",
        "Instrumentar telemetria para tempo médio por estágio",
      ]}
    />
  );
}
