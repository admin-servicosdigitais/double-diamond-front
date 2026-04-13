"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { systemToast, SystemCard } from "@/components/system";
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
    },
  });

  const onSubmit = async (values: NewWorkflowFormValues) => {
    form.clearErrors("root");

    try {
      const created = await createWorkflow.mutateAsync({
        workflow_id: values.workflow_id,
        name: values.name,
        words: [values.name],
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
