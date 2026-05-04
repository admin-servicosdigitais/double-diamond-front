"use client";

import { Activity, Bot, Command as CommandIcon, LayoutDashboard, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHealthQuery } from "@/hooks/api/use-domain-queries";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { HealthStatus } from "@/types/api/domain";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/agents", label: "Agentes", icon: Bot },
  { href: "/health", label: "Saúde da API", icon: Activity },
];

function healthDotClassName(status: HealthStatus | undefined) {
  if (status === "ok") return "bg-emerald-500";
  if (status === "degraded") return "bg-amber-500";
  return "bg-rose-500";
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/" || pathname.startsWith("/dashboard");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function IconRail() {
  const pathname = usePathname();
  const toggleCommandPalette = useUiStore((state) => state.toggleCommandPalette);
  const healthQuery = useHealthQuery();
  const healthStatus = healthQuery.data?.status;

  return (
    <aside className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-border/60 bg-card/60 py-4 backdrop-blur">
      <div className="flex flex-col items-center gap-1">
        <Link
          href="/dashboard"
          aria-label="Double Diamond — início"
          className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
        >
          DD
        </Link>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveRoute(pathname, href);
          const isHealth = href === "/health";

          return (
            <Tooltip key={href} delayDuration={150}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-label={label}
                  className={cn(
                    "focus-ring relative flex h-10 w-10 items-center justify-center rounded-lg transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isHealth && healthStatus !== undefined ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ring-2 ring-card",
                        healthDotClassName(healthStatus),
                      )}
                    />
                  ) : null}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Abrir command palette (Ctrl+K)"
            onClick={toggleCommandPalette}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <CommandIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">⌘K · busca rápida</TooltipContent>
      </Tooltip>
    </aside>
  );
}
