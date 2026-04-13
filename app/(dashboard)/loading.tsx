import { SystemSkeleton } from "@/components/system";

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <SystemSkeleton className="h-6 w-48" />
      <SystemSkeleton className="h-24 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <SystemSkeleton className="h-36 w-full" />
        <SystemSkeleton className="h-36 w-full" />
      </div>
    </div>
  );
}
