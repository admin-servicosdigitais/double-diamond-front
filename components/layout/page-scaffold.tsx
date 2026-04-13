import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageScaffoldProps {
  section: string;
  title: string;
  description: string;
  availableActions: string[];
  pendingItems: string[];
  primaryAction?: {
    label: string;
    href: string;
  };
}

export function PageScaffold({
  section,
  title,
  description,
  availableActions,
  pendingItems,
  primaryAction,
}: PageScaffoldProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            {section}
          </Badge>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {primaryAction && (
            <Link href={primaryAction.href}>
              <Button className="gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Button variant="outline">Ver documentação</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que posso fazer agora</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {availableActions.map((action) => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              O que falta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {pendingItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
