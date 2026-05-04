"use client";

import { ChevronDown, FileCode2, FileText, RefreshCw, TriangleAlert } from "lucide-react";

import { SystemSkeleton } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { flattenOutputDocuments, type OutputDocument } from "@/lib/workflow/artifact-preview";
import { cn } from "@/lib/utils";
import type { StageOutput } from "@/types/api/domain";

type Props = {
  outputs: StageOutput[] | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyHint?: string;
};

function ArtifactIcon({ document }: { document: OutputDocument }) {
  if (document.typeLabel === "HTML") return <FileCode2 className="h-4 w-4 text-indigo-500" />;
  return <FileText className="h-4 w-4 text-emerald-500" />;
}

function ArtifactItem({ document }: { document: OutputDocument }) {
  const fullContent = document.artifact.content ?? document.output.content ?? "";

  return (
    <article className="surface-soft space-y-2">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <ArtifactIcon document={document} />
          <div>
            <p className="text-sm font-medium text-foreground">{document.artifact.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{document.preview}</p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
          {document.typeLabel}
        </Badge>
      </header>

      {fullContent ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Ver completo
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-72 overflow-auto rounded-md border bg-background/60 p-3 text-xs leading-relaxed text-foreground/90">
              {fullContent}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </article>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      <SystemSkeleton className="h-20 w-full rounded-lg" />
      <SystemSkeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-rose-900">
      <div className="flex items-start gap-2">
        <TriangleAlert className="mt-0.5 h-4 w-4" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Não conseguimos carregar os outputs</p>
          <p className="text-xs opacity-90">
            Verifique se o estágio foi registrado corretamente ou recarregue para tentar novamente.
          </p>
        </div>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-8 gap-1.5 border-rose-200 bg-background/70 text-xs text-rose-900 hover:bg-rose-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Recarregar
        </Button>
      ) : null}
    </div>
  );
}

export function StageOutputsList({ outputs, isLoading, isError, onRetry, emptyHint }: Props) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  const documents = flattenOutputDocuments(outputs ?? []);

  if (documents.length === 0) {
    return (
      <p className={cn("rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground")}>
        {emptyHint ?? "Sem outputs publicados ainda. Execute o estágio para gerar artefatos."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <ArtifactItem key={document.key} document={document} />
      ))}
    </div>
  );
}

