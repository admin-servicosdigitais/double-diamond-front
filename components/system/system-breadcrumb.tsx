import { ChevronRight } from "lucide-react";
import Link from "next/link";

type Item = { label: string; href?: string };

export function SystemBreadcrumb({ items }: { items: Item[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1">
          {item.href ? (
            <Link href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "font-medium text-foreground" : ""}>{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-4 w-4" />}
        </span>
      ))}
    </nav>
  );
}
