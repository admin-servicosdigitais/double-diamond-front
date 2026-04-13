import type {
  Agent,
  Artifact,
  Health,
  HealthStatus,
  Stage,
  StageActionResponse,
  StageOutput,
  StageStatus,
  Workflow,
} from "@/types/api/domain";

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null ? (value as AnyRecord) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toStageNumber(value: string | number | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallback;

  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;

  const match = value.match(/\d+/);
  if (!match) return fallback;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeStageStatus(status: unknown): StageStatus {
  const normalized = asString(status, "").toLowerCase();

  if (normalized === "pending") return "not_started";
  if (normalized === "draft") return "running";
  if (normalized === "running") return "running";
  if (normalized === "awaiting_human_approval") return "awaiting_human_approval";
  if (normalized === "approved") return "approved";
  if (normalized === "completed") return "completed";
  if (normalized === "failed") return "error";

  return "not_started";
}

function normalizeArtifact(name: string, payload: unknown): Artifact {
  const data = asRecord(payload);

  return {
    name,
    content: typeof payload === "string" ? payload : asString(data.content),
    mimeType: asString(data.mimeType) || asString(data.mime_type),
    path: asString(data.path),
    size: typeof data.size === "number" ? data.size : undefined,
    updatedAt: asString(data.updated_at) || asString(data.updatedAt),
  };
}

function normalizeStageOutput(payload: unknown, stage: number, stageKey?: string): StageOutput {
  const data = asRecord(payload);
  const metadata = asRecord(data.metadata);

  const artifacts: Artifact[] = [];
  const compact = asString(data.compact_output_text);
  if (compact) {
    artifacts.push(
      normalizeArtifact(`stage-${stage}-compact.md`, {
        content: compact,
        updated_at: metadata.updated_at ?? data.updated_at,
      }),
    );
  }

  if (Array.isArray(data.full_output_paths)) {
    for (const fullPath of data.full_output_paths) {
      if (typeof fullPath !== "string") continue;
      const fileName = fullPath.split("/").pop() ?? fullPath;
      artifacts.push(
        normalizeArtifact(fileName, {
          path: fullPath,
          updated_at: metadata.updated_at ?? data.updated_at,
        }),
      );
    }
  }

  if (Array.isArray(data.artifacts)) {
    for (const artifact of data.artifacts) {
      const artifactData = asRecord(artifact);
      artifacts.push(normalizeArtifact(asString(artifactData.name, `artifact-${artifacts.length + 1}`), artifact));
    }
  }

  return {
    id: asString(data.id) || asString(data.run_id) || asString(metadata.run_id),
    stage,
    agentCode: asString(data.agent_code) || asString(data.agent_id),
    summary: compact || asString(data.summary),
    content: asString(data.content),
    artifacts,
    createdAt: asString(data.created_at),
    updatedAt: asString(data.updated_at) || asString(metadata.updated_at),
  };
}

export function normalizeAgent(payload: unknown): Agent {
  const data = asRecord(payload);

  return {
    id: asString(data.id),
    code: asString(data.id),
    stage: asString(data.stage),
    name: asString(data.name),
    description: asString(data.description),
    role: asString(data.role),
    model: asString(data.model),
    summary_format: asString(data.summary_format),
    capabilities: Array.isArray(data.tools) ? data.tools.filter((item): item is string => typeof item === "string") : [],
  };
}

export function normalizeWorkflow(payload: unknown): Workflow {
  const data = asRecord(payload);
  const rawStages = Array.isArray(data.stages) ? data.stages : [];

  const stages: Stage[] = rawStages.map((rawStage, index) => {
    const stageData = asRecord(rawStage);
    const stageKey = asString(stageData.id, String(index + 1));
    const stageNumber = toStageNumber(stageKey, index + 1);

    return {
      stage: stageNumber,
      stageKey,
      name: asString(stageData.name),
      status: normalizeStageStatus(stageData.status),
      startedAt: asString(stageData.created_at),
      finishedAt: asString(stageData.updated_at),
    };
  });

  const activeStage = stages.find((stage) => stage.status === "running" || stage.status === "awaiting_human_approval");
  const currentStage = activeStage?.stage ?? stages.find((stage) => stage.status === "approved")?.stage;
  const workflowStatus = activeStage?.status ?? stages[stages.length - 1]?.status ?? "not_started";

  return {
    id: asString(data.id),
    name: asString(data.name) || asString(data.id),
    status: workflowStatus,
    currentStage,
    stages,
    createdAt: asString(data.created_at),
    updatedAt: asString(data.updated_at),
  };
}

export function normalizeStage(payload: unknown, stageRef: string | number): Stage {
  const data = asRecord(payload);
  const stageKey = asString(data.id, String(stageRef));

  return {
    stage: toStageNumber(stageKey, toStageNumber(String(stageRef), 1)),
    stageKey,
    name: asString(data.name),
    status: normalizeStageStatus(data.status),
    startedAt: asString(data.created_at),
    finishedAt: asString(data.updated_at),
  };
}

export function normalizeStageActionResponse(payload: unknown, workflowId: string, stageRef: string | number): StageActionResponse {
  const data = asRecord(payload);

  return {
    workflowId: asString(data.workflow_id, workflowId),
    stage: toStageNumber(data.stage as string | number | undefined, toStageNumber(String(stageRef), 1)),
    status: normalizeStageStatus(data.status),
    message: asString(data.compact_output_text) || asString(data.message),
  };
}

export function normalizeStageOutputs(payload: unknown, stageRef: string | number): StageOutput[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeStageOutput(item, toStageNumber(String(stageRef), 1), String(stageRef)));
  }

  const data = asRecord(payload);
  if (Object.keys(data).length === 0) return [];

  if ("compact_output_text" in data || "full_output_paths" in data) {
    return [normalizeStageOutput(data, toStageNumber(asString(data.stage, String(stageRef)), 1), asString(data.stage, String(stageRef)))];
  }

  return Object.entries(data).map(([artifactName, content]) =>
    normalizeStageOutput(
      { content, artifacts: [{ name: artifactName, content }] },
      toStageNumber(String(stageRef), 1),
      String(stageRef),
    ),
  );
}

export function normalizeArtifactResponse(payload: unknown, artifactName: string): Artifact {
  if (typeof payload === "string") {
    return { name: artifactName, content: payload };
  }

  const data = asRecord(payload);
  if (typeof data.content === "string") {
    return normalizeArtifact(artifactName, data);
  }

  if (Object.keys(data).length === 1) {
    const [firstKey, firstValue] = Object.entries(data)[0];
    return normalizeArtifact(firstKey, firstValue);
  }

  return normalizeArtifact(artifactName, data);
}

export function normalizeHealth(payload: unknown): Health {
  const data = asRecord(payload);
  const rawStatus = asString(data.status);
  const status: HealthStatus = rawStatus === "ok" || rawStatus === "degraded" || rawStatus === "error" ? rawStatus : "ok";

  return {
    status,
    service: asString(data.service, "Agent Workflow Orchestrator"),
    version: asString(data.version),
    timestamp: asString(data.timestamp),
    dependencies: Object.fromEntries(
      Object.entries(data)
        .filter(([key]) => !["status", "service", "version", "timestamp"].includes(key))
        .map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)]),
    ),
  };
}
