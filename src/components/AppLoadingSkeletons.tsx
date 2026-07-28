import { Skeleton } from "@/components/ui/skeleton";

export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading content" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-[1.5rem] bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-2/3 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-4/5 rounded-full" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-7 w-16 rounded-full" />
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NotificationListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading notifications" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-3 rounded-[1.4rem] bg-card p-4 shadow-sm">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-3/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="Searching" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-[1.35rem] bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5 rounded-full" />
            <Skeleton className="h-3 w-4/5 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function JobDetailsSkeleton() {
  return (
    <div
      className="-mx-4 -mt-4 min-h-screen overflow-hidden bg-primary"
      aria-label="Loading job details"
      aria-busy="true"
    >
      <div className="px-4 pb-12 pt-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
          <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
          <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-2xl bg-white/20" />
          <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
          <Skeleton className="h-7 w-3/4 rounded-full bg-white/20" />
          <Skeleton className="h-4 w-1/2 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="mx-1.5 -mt-5 space-y-4 rounded-t-[2.5rem] bg-background px-4 pb-24 pt-6">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-[1.25rem]" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-[1.6rem]" />
        <Skeleton className="h-40 rounded-[1.6rem]" />
        <Skeleton className="h-20 rounded-[1.6rem]" />
      </div>
    </div>
  );
}
