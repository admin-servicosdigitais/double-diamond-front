"use client";

import { Activity, Bot, LayoutDashboard, PlusCircle, RefreshCw, Workflow as WorkflowIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAgentsQuery, useHealthQuery, useWorkflowsQuery } from "@/hooks/api/use-domain-queries";
import { useUiStore } from "@/store/ui-store";

const MAX_RECENT = 8;

export function CommandPalette() {
  const router = useRouter();
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);

  const workflowsQuery = useWorkflowsQuery();
  const agentsQuery = useAgentsQuery();
  const healthQuery = useHealthQuery();

  const workflows = (workflowsQuery.data ?? []).slice(0, MAX_RECENT);
  const agents = (agentsQuery.data ?? []).slice(0, MAX_RECENT);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar workflows, agentes ou ações…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Navegar">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> Dashboard
          </CommandItem>
          <CommandItem onSelect={() => go("/workflows")}>
            <WorkflowIcon /> Workflows
          </CommandItem>
          <CommandItem onSelect={() => go("/agents")}>
            <Bot /> Agentes
          </CommandItem>
          <CommandItem onSelect={() => go("/health")}>
            <Activity /> Saúde da API
          </CommandItem>
        </CommandGroup>

        {workflows.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Workflows recentes">
              {workflows.map((workflow) => (
                <CommandItem
                  key={workflow.id}
                  value={`workflow ${workflow.id} ${workflow.name ?? ""}`}
                  onSelect={() => go(`/workflows/${workflow.id}`)}
                >
                  <WorkflowIcon />
                  <span className="truncate">{workflow.name ?? workflow.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {agents.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Agentes">
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={`agent ${agent.id} ${agent.name ?? ""}`}
                  onSelect={() => go(`/agents/${agent.id}`)}
                >
                  <Bot />
                  <span className="truncate">{agent.name ?? agent.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => go("/workflows/new")}>
            <PlusCircle /> Criar workflow
          </CommandItem>
          <CommandItem
            onSelect={() => {
              healthQuery.refetch();
              setOpen(false);
            }}
          >
            <RefreshCw /> Atualizar saúde da API
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
