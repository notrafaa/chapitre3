import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-editorial pb-28 pt-32 sm:pt-40">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="mb-6 h-20 w-80 max-w-full" />
      <Skeleton className="mb-16 h-6 w-full max-w-xl" />

      <div className="mb-12 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-ink-800/70 p-0">
            <Skeleton className="aspect-[16/10] w-full rounded-b-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
