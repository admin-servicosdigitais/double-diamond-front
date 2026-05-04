"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Loader2, Sparkles, X } from "lucide-react";

import { systemToast } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/services/api/client";
import type { QualityGate, QualityGateAnswer, QualityGateQuestion } from "@/types/api/domain";

type Props = {
  gate: QualityGate | null;
  isGenerating: boolean;
  isAnswering: boolean;
  isSkipping: boolean;
  onSubmit: (answers: QualityGateAnswer[]) => Promise<unknown>;
  onSkip: () => Promise<void>;
  onClose: () => void;
};

function isAnswered(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function partitionQuestions(questions: QualityGateQuestion[]) {
  const required: QualityGateQuestion[] = [];
  const optional: QualityGateQuestion[] = [];
  for (const question of questions) {
    if (question.required === false) optional.push(question);
    else required.push(question);
  }
  return { required, optional };
}

function GateHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">Quality Gate</p>
          <p className="text-xs text-muted-foreground">
            Sincronize o que você sabe com o que a IA produziu — as respostas refinam os outputs.
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Fechar painel do quality gate"
        className="h-7 w-7"
      >
        <X className="h-4 w-4" />
      </Button>
    </header>
  );
}

function QuestionItem({
  question,
  value,
  onChange,
}: {
  question: QualityGateQuestion;
  value: string;
  onChange: (value: string) => void;
}) {
  const isOptional = question.required === false;
  return (
    <li className="space-y-1.5">
      <label htmlFor={`qg-${question.id}`} className="block text-sm font-medium text-foreground">
        {question.question}
        {isOptional ? <span className="ml-2 text-[10px] uppercase text-muted-foreground">opcional</span> : null}
      </label>
      {question.description ? (
        <p className="text-xs text-muted-foreground">{question.description}</p>
      ) : null}
      <Textarea
        id={`qg-${question.id}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={isOptional ? "Resposta opcional…" : "Sua resposta…"}
        className="min-h-[72px] text-sm"
      />
    </li>
  );
}

export function QualityGatePanel({
  gate,
  isGenerating,
  isAnswering,
  isSkipping,
  onSubmit,
  onSkip,
  onClose,
}: Props) {
  const [answersById, setAnswersById] = useState<Record<string, string>>({});

  const partitioned = useMemo(() => partitionQuestions(gate?.questions ?? []), [gate?.questions]);
  const requiredAllAnswered =
    partitioned.required.length === 0 ||
    partitioned.required.every((question) => isAnswered(answersById[question.id]));

  if (isGenerating) {
    return (
      <section className="rounded-xl border border-border/60 bg-muted/20 p-5">
        <GateHeader onClose={onClose} />
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analisando outputs e gerando perguntas…
        </div>
      </section>
    );
  }

  if (!gate) return null;

  async function handleSubmit() {
    const answers: QualityGateAnswer[] = (gate?.questions ?? [])
      .map((question) => ({ questionId: question.id, answer: (answersById[question.id] ?? "").trim() }))
      .filter((answer) => answer.answer.length > 0);

    if (gate && partitioned.required.some((question) => !isAnswered(answersById[question.id]))) {
      systemToast.warning("Faltam respostas", "Responda todas as perguntas obrigatórias para refinar os outputs.");
      return;
    }

    try {
      await onSubmit(answers);
      systemToast.success("Outputs em regeneração", "As respostas foram aplicadas e o estágio será reexecutado.");
    } catch (error) {
      systemToast.error("Erro ao aplicar respostas", getErrorMessage(error) ?? "Tente novamente em instantes.");
    }
  }

  async function handleSkip() {
    try {
      await onSkip();
    } catch (error) {
      systemToast.error("Erro ao pular", getErrorMessage(error) ?? "Não foi possível pular o quality gate.");
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-primary/30 bg-primary/[0.04] p-5">
      <GateHeader onClose={onClose} />

      {gate.diagnosis ? (
        <p className="rounded-md bg-background/60 p-3 text-xs leading-relaxed text-foreground/90">
          {gate.diagnosis}
        </p>
      ) : null}

      {gate.gaps && gate.gaps.length > 0 ? (
        <Collapsible defaultOpen={gate.gaps.length <= 2}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Lacunas detectadas ({gate.gaps.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-5 list-disc space-y-1 pt-1 text-xs text-muted-foreground">
              {gate.gaps.map((gap, index) => (
                <li key={`${index}-${gap}`}>{gap}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {partitioned.required.length === 0 && partitioned.optional.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
          Nenhuma pergunta gerada. A IA considera os outputs suficientes — você pode aprovar com segurança.
        </p>
      ) : (
        <ol className="space-y-4">
          {partitioned.required.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              value={answersById[question.id] ?? ""}
              onChange={(value) => setAnswersById((prev) => ({ ...prev, [question.id]: value }))}
            />
          ))}
        </ol>
      )}

      {partitioned.optional.length > 0 ? (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5 transition data-[state=open]:rotate-180" />
              Perguntas opcionais ({partitioned.optional.length})
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ol className="space-y-4 pt-2">
              {partitioned.optional.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  value={answersById[question.id] ?? ""}
                  onChange={(value) => setAnswersById((prev) => ({ ...prev, [question.id]: value }))}
                />
              ))}
            </ol>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {gate.recommendation ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase">
            Recomendação da IA
          </Badge>
          <span className="text-xs text-muted-foreground">{gate.recommendation}</span>
        </div>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button variant="ghost" size="sm" onClick={handleSkip} disabled={isAnswering || isSkipping} className="text-xs">
          Pular este quality gate
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isAnswering || !requiredAllAnswered || partitioned.required.length === 0 && partitioned.optional.length === 0}
          className={cn("h-11 min-w-[220px] gap-2 text-sm font-semibold")}
        >
          {isAnswering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Aplicar respostas e regerar
        </Button>
      </footer>
    </section>
  );
}
