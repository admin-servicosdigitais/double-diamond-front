"use client";

import { Bell, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={toggleSidebar}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">Human-in-the-loop AI workflows</p>
          <h1 className="text-base font-semibold">Workspace</h1>
        </div>
      </div>

      <Button variant="ghost" size="icon">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
