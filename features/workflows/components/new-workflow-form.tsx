"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { systemToast } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useCreateWorkflowMutation } from "@/hooks/api/use-domain-queries";
import { slugify } from "@/lib/slug";
import { getErrorMessage } from "@/services/api/client";

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const newWorkflowSchema = z.object({
  name: z
    .string()
    .min(3, "Informe um nome com ao menos 3 caracteres.")
    .max(120, "Use no máximo 120 caracteres."),
  workflow_id: z
    .string()
    .min(3, "ID com ao menos 3 caracteres.")
    .max(80, "ID com no máximo 80 caracteres.")
    .regex(ID_PATTERN, "Use apenas letras minúsculas, números e hífen."),
  words: z.array(z.string().min(1)).optional(),
});

type NewWorkflowFormValues = z.infer<typeof newWorkflowSchema>;

export function NewWorkflowForm() {
  const router = useRouter();
  const createWorkflow = useCreateWorkflowMutation();

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [wordInput, setWordInput] = useState("");
  const [idEditedManually, setIdEditedManually] = useState(false);

  const form = useForm<NewWorkflowFormValues>({
    resolver: zodResolver(newWorkflowSchema),
    defaultValues: { name: "", workflow_id: "", words: [] },
  });

  const nameValue = form.watch("name");
  const idValue = form.watch("workflow_id");
  const words = form.watch("words") ?? [];
  const derivedSlug = useMemo(() => slugify(nameValue || ""), [nameValue]);

  const effectiveId = idEditedManually ? idValue : derivedSlug;

  async function onSubmit(values: NewWorkflowFormValues) {
    form.clearErrors("root");
    const finalId = idEditedManually ? values.workflow_id : slugify(values.name);

    try {
      const created = await createWorkflow.mutateAsync({
        workflow_id: finalId,
        name: values.name,
        words: values.words ?? [],
      });

      systemToast.success("Workflow criado", "Abrindo o cockpit do workflow.");
      router.push(`/workflows/${created.id || finalId}`);
    } catch (error) {
      const message = getErrorMessage(error);
      form.setError("root", { type: "server", message });
      systemToast.error("Não foi possível criar o workflow", message);
    }
  }

  function addWord(rawWord: string) {
    const normalized = rawWord.trim();
    if (!normalized) return;
    const current = form.getValues("words") ?? [];
    if (current.some((word) => word.toLowerCase() === normalized.toLowerCase())) {
      setWordInput("");
      return;
    }
    form.setValue("words", [...current, normalized], { shouldDirty: true, shouldValidate: true });
    setWordInput("");
  }

  function removeWord(target: string) {
    const current = form.getValues("words") ?? [];
    form.setValue(
      "words",
      current.filter((word) => word !== target),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  const isSubmitting = form.formState.isSubmitting || createWorkflow.isPending;

  return (
    <div className="mx-auto w-full max-w-xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Novo workflow</h1>
        <p className="text-sm text-muted-foreground">
          Apenas o nome é obrigatório. Configurações avançadas ficam disponíveis abaixo, se você precisar.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Nome do workflow
          </label>
          <Input
            id="name"
            {...form.register("name")}
            onChange={(event) => {
              form.setValue("name", event.target.value, { shouldValidate: true, shouldDirty: true });
              if (!idEditedManually) {
                form.setValue("workflow_id", slugify(event.target.value), { shouldValidate: false });
              }
            }}
            autoFocus
            placeholder="Ex: Validação técnica Q2"
            aria-invalid={Boolean(form.formState.errors.name)}
            className="h-11 text-base"
          />
          <p className="text-xs text-muted-foreground">
            URL: <span className="font-mono text-foreground">/workflows/{effectiveId || "—"}</span>
          </p>
          {form.formState.errors.name ? (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="rounded-lg border border-border/60">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm"
            >
              <span>Avançado · ID custom e palavras-chave</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-5 border-t border-border/60 px-4 py-4">
            <div className="space-y-2">
              <label htmlFor="workflow_id" className="text-sm font-medium text-foreground">
                ID do workflow
              </label>
              <Input
                id="workflow_id"
                value={effectiveId}
                onChange={(event) => {
                  setIdEditedManually(true);
                  form.setValue("workflow_id", event.target.value, { shouldValidate: true, shouldDirty: true });
                }}
                placeholder={derivedSlug || "id-do-workflow"}
                aria-invalid={Boolean(form.formState.errors.workflow_id)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Por padrão, derivado do nome. Edite apenas se precisar de um identificador específico.
              </p>
              {form.formState.errors.workflow_id ? (
                <p className="text-xs text-destructive">{form.formState.errors.workflow_id.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="words" className="text-sm font-medium text-foreground">
                Palavras-chave (opcional)
              </label>
              <Input
                id="words"
                value={wordInput}
                onChange={(event) => setWordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  addWord(wordInput);
                }}
                placeholder="Pressione Enter para adicionar"
              />
              {words.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {words.map((word) => (
                    <Badge key={word} variant="secondary" className="gap-1 pr-1 text-xs">
                      {word}
                      <button
                        type="button"
                        onClick={() => removeWord(word)}
                        className="rounded-sm p-0.5 text-muted-foreground transition hover:text-foreground"
                        aria-label={`Remover ${word}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {form.formState.errors.root ? (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <Link
            href="/workflows"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            aria-disabled={isSubmitting}
            onClick={(event) => {
              if (isSubmitting) event.preventDefault();
            }}
          >
            Cancelar
          </Link>
          <Button type="submit" disabled={isSubmitting} className="h-11 min-w-[180px] gap-2 text-sm font-semibold">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Criar workflow
          </Button>
        </div>
      </form>
    </div>
  );
}
