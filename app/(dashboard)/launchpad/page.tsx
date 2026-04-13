import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LaunchpadPage() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Launchpad de Features</CardTitle>
        <CardDescription>Área para testes de novos fluxos, prompts e experiências de aprovação.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="gap-2">
          <Rocket className="h-4 w-4" />
          Criar experimento
        </Button>
      </CardContent>
    </Card>
  );
}
