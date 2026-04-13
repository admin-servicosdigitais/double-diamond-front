"use client";

import { Bell, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SystemBreadcrumb } from "@/components/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRouteContext } from "@/lib/navigation";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const pathname = usePathname();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { title, breadcrumbs, actions } = getRouteContext(pathname);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleSidebar} aria-label="Alternar barra lateral">
            <PanelLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 space-y-1">
            <SystemBreadcrumb items={breadcrumbs} />
            <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden items-center gap-2 text-xs text-emerald-700 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            API online
          </Badge>
          {actions.slice(0, 2).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={cn(buttonVariants({ variant: action.variant ?? "default", size: "sm" }), "hidden lg:inline-flex")}
            >
              {action.label}
            </Link>
          ))}
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
