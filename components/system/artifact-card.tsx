import { FileText, Paperclip } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ArtifactCardProps = {
  name: string;
  type: string;
  updatedAt: string;
};

export function ArtifactCard({ name, type, updatedAt }: ArtifactCardProps) {
  return (
    <Card className="hover:border-primary/30 hover:shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Paperclip className="h-3.5 w-3.5" />
          {updatedAt}
        </div>
      </CardContent>
    </Card>
  );
}
