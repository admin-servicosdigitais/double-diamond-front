import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkflowsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulo de Workflows</CardTitle>
        <CardDescription>
          Esta página está pronta para receber listagem avançada, detalhamento por estágio e ações de aprovação humana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Próximo passo: conectar filtros, timeline de execução e editor de artefatos com o backend REST.
        </p>
      </CardContent>
    </Card>
  );
}
