"use client";

import { Bell, PanelLeft } from "lucide-react";

import { SystemBreadcrumb } from "@/components/system";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label="Alternar barra lateral">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <SystemBreadcrumb items={[{ label: "Workspace" }, { label: "Dashboard" }]} />
        </div>
      </div>

      <Button variant="ghost" size="icon" aria-label="Notificações">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
