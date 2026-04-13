"use client";

import { Activity, Bot, LayoutDashboard, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/health", label: "System Health", icon: Activity },
];

export function AppSidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "border-r border-border/70 bg-card/70 backdrop-blur transition-all",
        sidebarCollapsed ? "w-[72px]" : "w-56 sm:w-72",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4 sm:px-5">
        {!sidebarCollapsed ? (
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">Double Diamond Ops</p>
            <p className="text-xs text-muted-foreground">AI-first workflow cockpit</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-primary">DD</p>
        )}
        {!sidebarCollapsed ? (
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </Badge>
        ) : null}
      </div>

      <nav className="flex flex-col gap-1.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
