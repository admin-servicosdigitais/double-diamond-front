import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Item = { label: string; href?: string };

export function SystemBreadcrumb({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="rounded-md px-1.5 py-0.5 transition hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground" : ""}>
              {item.label}
            </span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
        </span>
      ))}
    </nav>
  );
}
