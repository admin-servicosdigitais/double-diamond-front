"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { systemToast, SystemCard } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWorkflowMutation } from "@/hooks/api/use-domain-queries";
import { getErrorMessage } from "@/services/api/client";

const newWorkflowSchema = z.object({
  workflow_id: z
    .string()
    .min(3, "Informe um workflow_id com ao menos 3 caracteres.")
    .max(80, "Use no máximo 80 caracteres.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use apenas letras, números, hífen e underscore."),
  name: z.string().min(3, "Informe um nome com ao menos 3 caracteres.").max(120, "Use no máximo 120 caracteres."),
  words: z.array(z.string().min(1)).min(1, "Adicione ao menos 1 palavra-chave para iniciar o workflow."),
});

type NewWorkflowFormValues = z.infer<typeof newWorkflowSchema>;

export function NewWorkflowForm() {
  const router = useRouter();
  const createWorkflow = useCreateWorkflowMutation();

  const form = useForm<NewWorkflowFormValues>({
    resolver: zodResolver(newWorkflowSchema),
    defaultValues: {
      workflow_id: "",
      name: "",
      words: [],
    },
  });
  const words = form.watch("words");
  const [wordInput, setWordInput] = useState("");

  const onSubmit = async (values: NewWorkflowFormValues) => {
    form.clearErrors("root");

    try {
      const created = await createWorkflow.mutateAsync({
        workflow_id: values.workflow_id,
        name: values.name,
        words: values.words,
      });

      const createdWorkflowId = created.id || values.workflow_id;

      systemToast.success("Workflow criado com sucesso", "Agora você pode iniciar discovery, validação e definição por estágios.");
      router.push(`/workflows/${createdWorkflowId}`);
    } catch (error) {
      const message = getErrorMessage(error);

      form.setError("root", {
        type: "server",
        message,
      });

      systemToast.error("Não foi possível criar o workflow", message);
    }
  };

  const isSubmitting = form.formState.isSubmitting || createWorkflow.isPending;

  const addWord = (rawWord: string) => {
    const normalizedWord = rawWord.trim();
    if (!normalizedWord) return;

    const currentWords = form.getValues("words");
    if (currentWords.some((word) => word.toLowerCase() === normalizedWord.toLowerCase())) {
      setWordInput("");
      return;
    }

    form.setValue("words", [...currentWords, normalizedWord], { shouldDirty: true, shouldValidate: true });
    setWordInput("");
    form.clearErrors("words");
  };

  const removeWord = (wordToRemove: string) => {
    const filteredWords = form.getValues("words").filter((word) => word !== wordToRemove);
    form.setValue("words", filteredWords, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">Nova jornada</p>
        <h1 className="text-3xl font-semibold tracking-tight">Criar novo workflow</h1>
        <p className="text-sm text-muted-foreground">
          Você está prestes a iniciar uma nova jornada de discovery, validação e definição. Após criar, você será levado para
          a visão do workflow para acompanhar os próximos passos.
        </p>
      </header>

      <SystemCard title="Dados essenciais" description="Preencha apenas o necessário para começar com velocidade e clareza.">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="workflow_id" className="text-sm font-medium">
              workflow_id
            </label>
            <Input
              id="workflow_id"
              {...form.register("workflow_id")}
              placeholder="ex: discovery_q2_2026"
              aria-invalid={Boolean(form.formState.errors.workflow_id)}
            />
            <p className="text-xs text-muted-foreground">Identificador técnico único usado em URLs e integrações.</p>
            {form.formState.errors.workflow_id && (
              <p className="text-xs text-destructive">{form.formState.errors.workflow_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              name
            </label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="ex: Jornada de discovery do produto X"
              aria-invalid={Boolean(form.formState.errors.name)}
            />
            <p className="text-xs text-muted-foreground">Nome amigável para facilitar busca e colaboração entre operadores.</p>
            {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="words" className="text-sm font-medium">
              words
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
              placeholder="Digite uma palavra e pressione Enter"
              aria-invalid={Boolean(form.formState.errors.words)}
            />
            <p className="text-xs text-muted-foreground">
              Palavras-chave para disparar o workflow. Pressione Enter para adicionar cada termo.
            </p>

            {words.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {words.map((word) => (
                  <Badge key={word} variant="secondary" className="gap-1 pr-1">
                    {word}
                    <button
                      type="button"
                      onClick={() => removeWord(word)}
                      className="rounded-sm p-0.5 text-muted-foreground transition hover:text-foreground"
                      aria-label={`Remover palavra ${word}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}

            {form.formState.errors.words && <p className="text-xs text-destructive">{form.formState.errors.words.message}</p>}
          </div>

          {form.formState.errors.root && <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Criar workflow
            </Button>

            <Link
              href="/workflows"
              className={buttonVariants({ variant: "outline" })}
              aria-disabled={isSubmitting}
              onClick={(event) => {
                if (isSubmitting) event.preventDefault();
              }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </SystemCard>
    </div>
  );
}
