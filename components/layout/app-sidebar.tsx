"use client";

import { LayoutDashboard, Rocket, Workflow } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/launchpad", label: "Launchpad", icon: Rocket },
];

export function AppSidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    <aside className={cn("border-r bg-card transition-all", sidebarCollapsed ? "w-[84px]" : "w-72")}>
      <div className="flex h-16 items-center border-b px-5">
        <p className="text-sm font-semibold tracking-wide text-primary">Double Diamond Ops</p>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {!sidebarCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
