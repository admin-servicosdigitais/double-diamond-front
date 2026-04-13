"use client";

import { Fragment, type ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock3,
  FileCode2,
  FileText,
  PencilLine,
  UserCheck,
} from "lucide-react";

import { EmptyState, SystemBreadcrumb, SystemCard, SystemSkeleton } from "@/components/system";
import { systemToast } from "@/components/system/system-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useArtifactQuery,
  usePatchArtifactMutation,
  useStageOutputsQuery,
  useWorkflowQuery,
} from "@/hooks/api/use-domain-api";
import { formatWorkflowDate } from "@/lib/workflow/display";

function formatBytes(size?: number) {
  if (!size || size <= 0) return "n/d";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function detectRenderableMode(content: string, mimeType?: string, artifactName?: string) {
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  const normalizedName = artifactName?.toLowerCase() ?? "";
  const textLooksLikeMarkdown = /^\s*(#|>|- |\* |\d+\. |```)/m.test(content);

  if (normalizedMime.includes("markdown") || normalizedName.endsWith(".md") || textLooksLikeMarkdown) {
    return "markdown" as const;
  }

  if (normalizedMime.includes("text/plain") || normalizedName.endsWith(".txt")) {
    return "text" as const;
  }

  if (normalizedMime.includes("html") || normalizedName.endsWith(".html") || normalizedName.endsWith(".htm")) {
    return "html" as const;
  }

  return "text" as const;
}

function renderInline(text: string): ReactNode[] {
  const chunks = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\)]+\))/g).filter(Boolean);

  return chunks.map((chunk, index) => {
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      return (
        <code key={`${chunk}-${index}`} className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
          {chunk.slice(1, -1)}
        </code>
      );
    }

    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return <strong key={`${chunk}-${index}`}>{chunk.slice(2, -2)}</strong>;
    }

    if (chunk.startsWith("*") && chunk.endsWith("*")) {
      return <em key={`${chunk}-${index}`}>{chunk.slice(1, -1)}</em>;
    }

    const linkMatch = chunk.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={`${chunk}-${index}`} className="text-primary underline" href={linkMatch[2]} rel="noreferrer" target="_blank">
          {linkMatch[1]}
        </a>
      );
    }

    return <Fragment key={`${chunk}-${index}`}>{chunk}</Fragment>;
  });
}

function MarkdownViewer({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const codeRows: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeRows.push(lines[i]);
        i += 1;
      }
      nodes.push(
        <pre key={`code-${i}`} className="overflow-x-auto rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed">
          <code>{codeRows.join("\n")}</code>
        </pre>
      );
      i += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const className =
        level === 1
          ? "text-3xl font-semibold"
          : level === 2
            ? "text-2xl font-semibold"
            : level === 3
              ? "text-xl font-semibold"
              : "text-lg font-semibold";

      nodes.push(
        <h2 key={`heading-${i}`} className={`${className} mt-2`}>
          {renderInline(text)}
        </h2>
      );
      i += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const listRows: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        listRows.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }

      nodes.push(
        <ul key={`ul-${i}`} className="list-disc space-y-1 pl-6">
          {listRows.map((item, index) => (
            <li key={`${item}-${index}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const listRows: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        listRows.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }

      nodes.push(
        <ol key={`ol-${i}`} className="list-decimal space-y-1 pl-6">
          {listRows.map((item, index) => (
            <li key={`${item}-${index}`}>{renderInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim().startsWith(">")) {
      const quoteRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteRows.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }

      nodes.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-primary/35 pl-4 text-muted-foreground">
          {quoteRows.map((row, index) => (
            <p key={`${row}-${index}`}>{renderInline(row)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    if (!line.trim()) {
      nodes.push(<div key={`space-${i}`} className="h-1" />);
      i += 1;
      continue;
    }

    const paragraphRows: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith("```")
    ) {
      paragraphRows.push(lines[i]);
      i += 1;
    }

    nodes.push(
      <p key={`p-${i}`} className="leading-7 text-foreground/95">
        {renderInline(paragraphRows.join(" "))}
      </p>
    );
  }

  return <div className="space-y-3 text-[15px]">{nodes}</div>;
}

function TextViewer({ content }: { content: string }) {
  return <pre className="overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{content}</pre>;
}

export function ArtifactDetailsView({
  workflowId,
  stageId,
  artifactName,
}: {
  workflowId: string;
  stageId: string;
  artifactName: string;
}) {
  const router = useRouter();
  const decodedArtifactName = decodeURIComponent(artifactName);
  const stageNumber = Number(stageId);
  const safeStage = Number.isFinite(stageNumber) ? stageNumber : 1;

  const workflowQuery = useWorkflowQuery(workflowId);
  const outputsQuery = useStageOutputsQuery(workflowId, safeStage);
  const artifactQuery = useArtifactQuery(workflowId, safeStage, decodedArtifactName);
  const patchArtifactMutation = usePatchArtifactMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [reason, setReason] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState<(() => void) | null>(null);
  const [humanEdited, setHumanEdited] = useState(false);

  const artifactOutput = useMemo(
    () =>
      outputsQuery.data?.find((output) =>
        output.artifacts?.some((artifact) => artifact.name.toLowerCase() === decodedArtifactName.toLowerCase())
      ),
    [outputsQuery.data, decodedArtifactName]
  );

  if (workflowQuery.isLoading || outputsQuery.isLoading || artifactQuery.isLoading) {
    return (
      <div className="space-y-4">
        <SystemSkeleton className="h-20 w-full rounded-xl" />
        <SystemSkeleton className="h-[460px] w-full rounded-xl" />
      </div>
    );
  }

  if (workflowQuery.isError || outputsQuery.isError || artifactQuery.isError || !workflowQuery.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Erro ao abrir artefato"
        description="Não foi possível carregar este output agora. Atualize a página e tente novamente."
        actionLabel="Tentar novamente"
        onAction={() => {
          workflowQuery.refetch();
          outputsQuery.refetch();
          artifactQuery.refetch();
        }}
      />
    );
  }

  if (!Number.isFinite(stageNumber) || !artifactQuery.data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Artefato não encontrado"
        description="Não encontramos o artefato solicitado para este estágio."
      />
    );
  }

  const artifact = artifactQuery.data;
  const content = artifact.content ?? artifactOutput?.content ?? artifactOutput?.summary ?? "";
  const hasUnsavedChanges = isEditing && (editedContent !== content || reason.trim().length > 0);
  const renderMode = detectRenderableMode(content, artifact.mimeType, artifact.name);
  const previewMode = detectRenderableMode(editedContent, artifact.mimeType, artifact.name);
  const shouldShowHumanEditedBadge = humanEdited || Boolean((artifact as { editedByHuman?: boolean }).editedByHuman);

  useEffect(() => {
    if (!isEditing) {
      setEditedContent(content);
    }
  }, [content, isEditing]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  const askForLeaveConfirmation = (action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingLeaveAction(() => action);
      setShowLeaveConfirm(true);
      return;
    }

    action();
  };

  const confirmLeave = () => {
    pendingLeaveAction?.();
    setShowLeaveConfirm(false);
    setPendingLeaveAction(null);
  };

  const cancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingLeaveAction(null);
  };

  const startEditing = () => {
    setEditedContent(content);
    setReason("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    askForLeaveConfirmation(() => {
      setIsEditing(false);
      setEditedContent(content);
      setReason("");
    });
  };

  const saveChanges = async ({ goBack }: { goBack: boolean }) => {
    try {
      await patchArtifactMutation.mutateAsync({
        workflowId,
        stage: safeStage,
        artifactName: decodedArtifactName,
        payload: {
          content: editedContent,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
      });

      setHumanEdited(true);
      setReason("");
      setIsEditing(false);
      systemToast.success("Artefato atualizado", "As alterações foram salvas com sucesso.");

      if (goBack) {
        router.push(`/workflows/${workflowId}/stages/${safeStage}/outputs`);
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : "Não foi possível salvar agora.";
      systemToast.error("Falha ao salvar", description);
    }
  };

  return (
    <div className="space-y-6">
      <SystemBreadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workflows", href: "/workflows" },
          { label: workflowQuery.data.name, href: `/workflows/${workflowId}` },
          { label: `Stage ${safeStage}`, href: `/workflows/${workflowId}/stages/${safeStage}` },
          { label: "Outputs", href: `/workflows/${workflowId}/stages/${safeStage}/outputs` },
          { label: decodedArtifactName },
        ]}
      />

      <section className="rounded-xl border bg-card/95 p-5 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{decodedArtifactName}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="gap-1" variant="secondary">
                <Bot className="h-3.5 w-3.5" /> Gerado por IA
              </Badge>
              {shouldShowHumanEditedBadge ? (
                <Badge className="gap-1" variant="outline">
                  <UserCheck className="h-3.5 w-3.5" /> Editado por humano
                </Badge>
              ) : null}
              <Badge className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Aprovado
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {!isEditing ? (
              <Button className="gap-1" size="sm" onClick={startEditing}>
                <PencilLine className="h-4 w-4" /> Editar conteúdo
              </Button>
            ) : (
              <>
                <Button
                  className="gap-1"
                  size="sm"
                  onClick={() => saveChanges({ goBack: false })}
                  disabled={patchArtifactMutation.isPending || !editedContent.trim()}
                >
                  Salvar
                </Button>
                <Button className="gap-1" size="sm" variant="secondary" onClick={cancelEditing} disabled={patchArtifactMutation.isPending}>
                  Cancelar
                </Button>
                <Button
                  className="gap-1"
                  size="sm"
                  variant="outline"
                  onClick={() => saveChanges({ goBack: true })}
                  disabled={patchArtifactMutation.isPending || !editedContent.trim()}
                >
                  Salvar e voltar à lista
                </Button>
              </>
            )}
            <Button
              className="gap-1"
              size="sm"
              variant="outline"
              onClick={() => askForLeaveConfirmation(() => router.push(`/workflows/${workflowId}/stages/${safeStage}/outputs`))}
            >
                <FileText className="h-4 w-4" /> Voltar para outputs
            </Button>
            <Button
              className="gap-1"
              size="sm"
              variant="outline"
              onClick={() => askForLeaveConfirmation(() => router.push(`/workflows/${workflowId}/stages/${safeStage}`))}
            >
                <Clock3 className="h-4 w-4" /> Voltar para estágio
            </Button>
          </div>
        </div>
      </section>

      <div className={`grid gap-4 ${isEditing ? "xl:grid-cols-[2fr_1.15fr]" : "xl:grid-cols-[1.9fr_0.85fr]"}`}>
        <SystemCard title={isEditing ? "Editar conteúdo" : "Conteúdo"} description="Leitura premium com foco em clareza, contexto e revisão humana.">
          {!isEditing ? (
            !content ? (
              <p className="text-sm text-muted-foreground">Sem conteúdo textual disponível para exibição.</p>
            ) : renderMode === "markdown" ? (
              <MarkdownViewer content={content} />
            ) : renderMode === "html" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Renderização HTML simplificada indisponível. Exibindo conteúdo em modo texto seguro.
                </p>
                <TextViewer content={content} />
              </div>
            ) : (
              <TextViewer content={content} />
            )
          ) : (
            <div className="space-y-4">
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                Você está editando um artefato gerado por IA. Suas alterações entram no histórico para rastreabilidade humana.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Conteúdo do artefato</label>
                <Textarea
                  value={editedContent}
                  onChange={(event) => setEditedContent(event.target.value)}
                  className="min-h-[320px] font-mono text-sm"
                  placeholder="Edite o conteúdo aqui..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contexto da alteração (opcional)</label>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="min-h-[100px]"
                  placeholder="Descreva o porquê da mudança para facilitar governança, auditoria e handoff."
                />
              </div>
              {patchArtifactMutation.isPending ? (
                <p className="text-sm text-muted-foreground">Salvando alterações...</p>
              ) : null}
            </div>
          )}
        </SystemCard>

        <SystemCard title="Metadados" description="Metadados para auditoria e contexto operacional.">
          {!isEditing ? (
            <dl className="space-y-3 text-sm">
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Nome do arquivo</dt>
                <dd className="font-medium">{artifact.name}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Tipo</dt>
                <dd>{artifact.mimeType ?? "text/markdown (inferido)"}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Tamanho</dt>
                <dd>{formatBytes(artifact.size)}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Atualizado em</dt>
                <dd>{formatWorkflowDate(artifact.updatedAt ?? artifactOutput?.updatedAt ?? artifactOutput?.createdAt)}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Agente</dt>
                <dd>{artifactOutput?.agentCode ?? "n/d"}</dd>
              </div>
              <div className="rounded-lg border p-3">
                <dt className="text-xs text-muted-foreground">Modo de visualização</dt>
                <dd className="flex items-center gap-1">
                  <FileCode2 className="h-3.5 w-3.5" /> {renderMode === "markdown" ? "Markdown rico" : "Texto formatado"}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showPreview} onChange={(event) => setShowPreview(event.target.checked)} />
                Mostrar preview lado a lado (desktop)
              </label>
              {showPreview ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Preview</p>
                  <div className="max-h-[500px] overflow-auto rounded-lg border p-3">
                    {previewMode === "markdown" ? <MarkdownViewer content={editedContent} /> : <TextViewer content={editedContent} />}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </SystemCard>
      </div>

      {showLeaveConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background p-4 shadow-xl">
            <h2 className="text-lg font-semibold">Descartar mudanças não salvas?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você possui mudanças não salvas. Se sair agora, essas alterações serão perdidas.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelLeave}>
                Continuar editando
              </Button>
              <Button variant="destructive" onClick={confirmLeave}>
                Sair sem salvar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
