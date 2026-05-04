"use client";

import { Command as CommandIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRouteContext } from "@/lib/navigation";
import { useUiStore } from "@/store/ui-store";

export function AppHeader() {
  const pathname = usePathname();
  const toggleCommandPalette = useUiStore((state) => state.toggleCommandPalette);
  const { title, primaryAction } = getRouteContext(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="flex min-h-16 items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>

        <div className="flex items-center gap-2">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              className={cn(buttonVariants({ variant: primaryAction.variant ?? "default", size: "sm" }))}
            >
              {primaryAction.label}
            </Link>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCommandPalette}
            aria-label="Abrir command palette"
            className="hidden gap-1.5 text-xs text-muted-foreground md:inline-flex"
          >
            <CommandIcon className="h-3.5 w-3.5" />
            ⌘K
          </Button>
        </div>
      </div>
    </header>
  );
}
