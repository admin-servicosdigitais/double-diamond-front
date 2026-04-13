import { ChevronRight } from "lucide-react";

type Item = { label: string };

export function SystemBreadcrumb({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-1">
          <span className={index === items.length - 1 ? "font-medium text-foreground" : ""}>{item.label}</span>
          {index < items.length - 1 && <ChevronRight className="h-4 w-4" />}
        </span>
      ))}
    </nav>
  );
}
