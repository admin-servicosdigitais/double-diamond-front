import type { Artifact, StageOutput } from "@/types/api/domain";

export type ArtifactTypeLabel = "Markdown" | "HTML" | "Documento";
export type ArtifactCategory = "compact" | "full" | "não inferido";

export type OutputDocument = {
  key: string;
  artifact: Artifact;
  output: StageOutput;
  typeLabel: ArtifactTypeLabel;
  category: ArtifactCategory;
  preview: string;
};

const PREVIEW_MAX_LENGTH = 180;

export function inferArtifactType(artifact: Artifact): ArtifactTypeLabel {
  const name = artifact.name?.toLowerCase() ?? "";
  const mime = artifact.mimeType?.toLowerCase() ?? "";

  if (name.endsWith(".md") || mime.includes("markdown")) return "Markdown";
  if (name.endsWith(".html") || name.endsWith(".htm") || mime.includes("text/html")) return "HTML";
  return "Documento";
}

export function inferCategory(artifactName: string): ArtifactCategory {
  const normalized = artifactName.toLowerCase();
  if (normalized.includes("compact") || normalized.includes("summary") || normalized.includes("resumo")) return "compact";
  if (normalized.includes("full") || normalized.includes("complete") || normalized.includes("completo")) return "full";
  return "não inferido";
}

export function getPreviewText(output: StageOutput, artifact: Artifact, maxLength = PREVIEW_MAX_LENGTH) {
  const source = artifact.content ?? output.summary ?? output.content ?? "";
  const plainText = source.replace(/[#>*`]/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (!plainText) return "Prévia indisponível para este artefato.";
  if (plainText.length <= maxLength) return plainText;
  return `${plainText.slice(0, maxLength)}…`;
}

export function flattenOutputDocuments(outputs: StageOutput[]): OutputDocument[] {
  return outputs.flatMap((output, outputIndex) =>
    (output.artifacts ?? []).map((artifact, artifactIndex) => ({
      key: output.id ?? `${output.stage}-${outputIndex}-${artifact.name}-${artifactIndex}`,
      artifact,
      output,
      typeLabel: inferArtifactType(artifact),
      category: inferCategory(artifact.name),
      preview: getPreviewText(output, artifact),
    })),
  );
}
