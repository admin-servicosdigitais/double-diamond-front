"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, FileCode2, FileText, PencilLine } from "lucide-react";

import { AlertBanner, EmptyState, PremiumPageSkeleton, StatusPill, SystemBreadcrumb, SystemCard, UXStateCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStageOutputsQuery, useWorkflowQuery } from "@/hooks/api/use-domain-queries";
import { formatWorkflowDate } from "@/lib/workflow/display";
import { getStageBlueprint, inferStageSummary, mergeStageWithBlueprint } from "@/lib/workflow/stages";
import type { Artifact, StageOutput } from "@/types/api/domain";

type OutputDocument = {
  key: string;
  artifact: Artifact;
  output: StageOutput;
  typeLabel: "Markdown" | "HTML" | "Documento";
  category: "compact" | "full" | "não inferido";
  preview: string;
};

function inferArtifactType(artifact: Artifact): OutputDocument["typeLabel"] {
  const name = artifact.name?.toLowerCase() ?? "";
  const mime = artifact.mimeType?.toLowerCase() ?? "";

  if (name.endsWith(".md") || mime.includes("markdown")) return "Markdown";
  if (name.endsWith(".html") || name.endsWith(".htm") || mime.includes("text/html")) return "HTML";
  return "Documento";
}

function inferCategory(artifactName: string): OutputDocument["category"] {
  const normalized = artifactName.toLowerCase();
  if (normalized.includes("compact") || normalized.includes("summary") || normalized.includes("resumo")) return "compact";
  if (normalized.includes("full") || normalized.includes("complete") || normalized.includes("completo")) return "full";
  return "não inferido";
}

function getPreviewText(output: StageOutput, artifact: Artifact) {
  const source = artifact.content ?? output.summary ?? output.content ?? "";
  const plainText = source.replace(/[#>*`]/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (!plainText) return "Prévia indisponível para este artefato.";
  if (plainText.length <= 180) return plainText;
  return `${plainText.slice(0, 180)}...`;
}

function flattenOutputDocuments(outputs: StageOutput[]): OutputDocument[] {
  return outputs.flatMap((output, outputIndex) =>
    (output.artifacts ?? []).map((artifact, artifactIndex) => ({
      key: output.id ?? `${output.stage}-${outputIndex}-${artifact.name}-${artifactIndex}`,
      artifact,
      output,
      typeLabel: inferArtifactType(artifact),
      category: inferCategory(artifact.name),
      preview: getPreviewText(output, artifact),
    }))
  );
}

export function StageOutputsView({ workflowId, stageId }: { workflowId: string; stageId: string }) {
  const stageNumber = Number(stageId);
  const safeStage = Number.isFinite(stageNumber) ? stageNumber : 1;

  const workflowQuery = useWorkflowQuery(workflowId);
  const outputsQuery = useStageOutputsQuery(workflowId, safeStage);

  const stage = useMemo(() => {
    if (!workflowQuery.data || !Number.isFinite(stageNumber)) return undefined;
    const stageFromWorkflow = workflowQuery.data.stages?.find((item) => item.stage === stageNumber);
    return mergeStageWithBlueprint(stageNumber, stageFromWorkflow);
  }, [workflowQuery.data, stageNumber]);

  const documents = useMemo(() => flattenOutputDocuments(outputsQuery.data ?? []), [outputsQuery.data]);

  const latestOutputByAgentCode = useMemo(() => {
    const grouped = new Map<string, StageOutput>();

    for (const output of outputsQuery.data ?? []) {
      const key = output.agentCode ?? "unknown_agent";
      const current = grouped.get(key);
      const outputDate = new Date(output.updatedAt ?? output.createdAt ?? 0).getTime();
      const currentDate = new Date(current?.updatedAt ?? current?.createdAt ?? 0).getTime();
      if (!current || outputDate > currentDate) {
        grouped.set(key, output);
      }
    }

    return grouped;
  }, [outputsQuery.data]);

  if (workflowQuery.isLoading || outputsQuery.isLoading) {
    return <PremiumPageSkeleton />;
  }

  if (workflowQuery.isError || outputsQuery.isError || !workflowQuery.data) {
    return (
      <UXStateCard
        kind="error"
        title="Não conseguimos carregar os outputs deste estágio"
        description="Recarregue para recuperar documentos, resumos e histórico de execução sem perder contexto."
        actionLabel="Recarregar outputs"
        onAction={() => {
          workflowQuery.refetch();
          outputsQuery.refetch();
        }}
      />
    );
  }

  if (!Number.isFinite(stageNumber) || !stage) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Estágio inválido"
        description="O estágio informado não é válido para este workflow."
      />
    );
  }

  const stageBlueprint = getStageBlueprint(stageNumber);

  return (
    <div className="space-y-6">
      <SystemBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workflows", href: "/workflows" },
          { label: workflowQuery.data.name, href: `/workflows/${workflowQuery.data.id}` },
          { label: `Stage ${stage.stage}`, href: `/workflows/${workflowQuery.data.id}/stages/${stage.stage}` },
          { label: "Outputs" },
        ]}
      />

      <section className="rounded-xl border bg-card/95 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Output hub</p>
            <h1 className="text-2xl font-semibold">Outputs do estágio {stage.stage}</h1>
            <p className="text-sm text-muted-foreground">
              {stageBlueprint?.description ?? "Revise os artefatos do estágio com foco em velocidade, contexto e decisão segura."}
            </p>
          </div>
          <StatusPill status={stage.status} />
        </div>
      </section>

      <SystemCard title="Resumo do estágio" description="Contexto operacional para revisar artefatos com rapidez.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{inferStageSummary(stage.status)}</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Última atualização</p>
            <p className="text-sm font-medium">{formatWorkflowDate(stage.finishedAt ?? stage.startedAt)}</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Outputs da etapa</p>
            <p className="text-sm font-medium">{outputsQuery.data?.length ?? 0} execuções</p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Artefatos elegíveis</p>
            <p className="text-sm font-medium">{documents.length} documentos</p>
          </div>
        </div>
      </SystemCard>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/workflows/${workflowId}/stages/${stage.stage}`}>
          <Button variant="outline">Voltar ao estágio</Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum output publicado até agora"
          description="Assim que a etapa for executada, os artefatos aparecerão aqui com prévia, tipo e acesso rápido para revisão."
        />
      ) : (
        <SystemCard
          title="Lista de outputs"
          description="Lista priorizada para leitura rápida, validação humana e ação imediata."
        >
          <div className="grid gap-3">
            {documents.map((document) => {
              const artifactName = encodeURIComponent(document.artifact.name);
              const updatedAt = formatWorkflowDate(document.artifact.updatedAt ?? document.output.updatedAt ?? document.output.createdAt);
              const reviewStatus = document.output.summary ? "Resumo disponível" : "Revisão pendente";
              const isHtml = document.typeLabel === "HTML";

              return (
                <article key={document.key} className="rounded-xl border bg-background p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isHtml ? <FileCode2 className="h-4 w-4 text-indigo-500" /> : <FileText className="h-4 w-4 text-emerald-500" />}
                        <h3 className="text-base font-semibold">{document.artifact.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{document.preview}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{document.typeLabel}</Badge>
                      <Badge variant="outline">Categoria · {document.category}</Badge>
                      <Badge variant="outline">{reviewStatus}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Atualizado: {updatedAt}</span>
                      <span>Agente: {document.output.agentCode ?? "n/d"}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/workflows/${workflowId}/stages/${stage.stage}/outputs/${artifactName}`}>
                        <Button size="sm" variant="secondary" className="gap-1">
                          <Eye className="h-3.5 w-3.5" /> Abrir
                        </Button>
                      </Link>
                      <Link href={`/workflows/${workflowId}/stages/${stage.stage}/outputs/${artifactName}`}>
                        <Button size="sm" className="gap-1">
                          <PencilLine className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SystemCard>
      )}

      <AlertBanner
        tone="info"
        title="Preparado para latest output por agent_code"
        description={`Base de agrupamento ativa para ${latestOutputByAgentCode.size} agent_code(s), pronta para expandir o modo \"latest por agente\".`}
      />
    </div>
  );
}
