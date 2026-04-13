import { cn } from "@/lib/utils";

export function SystemSkeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden />;
}

export function WorkflowListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border p-3">
          <SystemSkeleton className="h-4 w-1/3" />
          <SystemSkeleton className="mt-2 h-3 w-2/3" />
          <SystemSkeleton className="mt-3 h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}
