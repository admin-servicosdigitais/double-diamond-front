"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlayCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { systemToast, SystemCard } from "@/components/system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  workflowName: z.string().min(3, "Informe ao menos 3 caracteres."),
  objective: z.string().min(10, "Descreva melhor o objetivo do workflow."),
});

type FormValues = z.infer<typeof schema>;

export function QuickWorkflowForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      workflowName: "",
      objective: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    systemToast.success("Workflow pronto para integração", `\"${values.workflowName}\" validado no frontend.`);
    form.reset();
  };

  return (
    <SystemCard title="Novo fluxo orientado por IA" description="Componente reutilizável com validação e estados de foco." >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Nome do workflow</p>
          <Input {...form.register("workflowName")} placeholder="Ex: GTM do produto Enterprise" />
          {form.formState.errors.workflowName && (
            <p className="text-xs text-destructive">{form.formState.errors.workflowName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Objetivo</p>
          <Textarea {...form.register("objective")} placeholder="Descreva o resultado esperado em cada estágio." />
          {form.formState.errors.objective && (
            <p className="text-xs text-destructive">{form.formState.errors.objective.message}</p>
          )}
        </div>

        <Button type="submit" className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Validar UX
        </Button>
      </form>
    </SystemCard>
  );
}
