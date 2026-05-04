import { AppHeader } from "@/components/layout/app-header";
import { CommandPaletteProvider } from "@/components/layout/command-palette-provider";
import { IconRail } from "@/components/layout/icon-rail";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      <CommandPaletteProvider>
        <div className="flex min-h-screen bg-background">
          <IconRail />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">{children}</main>
          </div>
        </div>
      </CommandPaletteProvider>
    </TooltipProvider>
  );
}
