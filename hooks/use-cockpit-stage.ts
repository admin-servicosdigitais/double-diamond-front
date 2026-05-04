"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { getStageBlueprint } from "@/lib/workflow/stages";
import type { Stage } from "@/types/api/domain";

const STAGE_PARAM = "stage";
const COMPOSITE_STAGE_PATTERN = /^\d+-[a-z][a-z0-9-]*$/;

/**
 * Resolve um valor da URL (`?stage=...`) para o stageKey canônico (`<número>-<slug>`).
 *
 * Suporta:
 * - `?stage=2-intake` → mantém literalmente
 * - `?stage=2` (legacy) → resolve via blueprint para `2-intake`
 * - `?stage=qualquer-coisa` → mantém se existir entre os stages, senão devolve undefined
 */
function resolveStageKey(rawValue: string | null, stages: Stage[]): string | undefined {
  if (!rawValue) return undefined;
  if (COMPOSITE_STAGE_PATTERN.test(rawValue)) return rawValue;

  const numericMatch = rawValue.match(/^(\d+)$/);
  if (numericMatch) {
    const stageNumber = Number(numericMatch[1]);
    const blueprint = getStageBlueprint(stageNumber);
    if (blueprint?.stageKey) return blueprint.stageKey;
    const fromStages = stages.find((stage) => stage.stage === stageNumber)?.stageKey;
    if (fromStages) return fromStages;
  }

  return stages.find((stage) => stage.stageKey === rawValue)?.stageKey;
}

export function useCockpitStage(stages: Stage[], initialStageKey?: string, fallbackStageKey?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial =
    resolveStageKey(initialStageKey ?? null, stages) ??
    fallbackStageKey ??
    stages[0]?.stageKey ??
    "1-explorer";

  const [selectedStageKey, setSelectedStageKey] = useState<string>(initial);

  // Sincroniza estado quando a URL muda externamente (ex: usuário navega via Cmd+K).
  useEffect(() => {
    const fromUrl = resolveStageKey(searchParams.get(STAGE_PARAM), stages);
    if (fromUrl && fromUrl !== selectedStageKey) {
      setSelectedStageKey(fromUrl);
    }
  }, [searchParams, selectedStageKey, stages]);

  // Se a URL veio com formato legacy (`?stage=2`), normaliza para composite (`?stage=2-intake`).
  useEffect(() => {
    const raw = searchParams.get(STAGE_PARAM);
    if (raw && raw !== selectedStageKey && !COMPOSITE_STAGE_PATTERN.test(raw)) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(STAGE_PARAM, selectedStageKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams, selectedStageKey]);

  const updateStage = useCallback(
    (nextStageKey: string) => {
      setSelectedStageKey(nextStageKey);
      const params = new URLSearchParams(searchParams.toString());
      params.set(STAGE_PARAM, nextStageKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { selectedStageKey, setSelectedStage: updateStage } as const;
}
