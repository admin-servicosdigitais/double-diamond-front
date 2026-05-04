"use client";

import { useEffect } from "react";

import { CommandPalette } from "@/components/layout/command-palette";
import { useUiStore } from "@/store/ui-store";

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const toggle = useUiStore((state) => state.toggleCommandPalette);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const isPaletteCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isPaletteCombo) return;

      event.preventDefault();
      toggle();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
