import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
};

export function ActionCard({ icon: Icon, title, description, cta }: ActionCardProps) {
  return (
    <Card className="group border-dashed transition hover:border-primary/40 hover:bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="w-fit rounded-lg bg-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm">
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}
