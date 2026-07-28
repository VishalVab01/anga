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

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-4 pb-24" aria-label="Loading profile" aria-busy="true">
      <section className="rounded-[2rem] bg-gradient-to-br from-primary via-[#2f6fec] to-[#759cff] p-5 shadow-2xl shadow-primary/20">
        <div className="flex items-start gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-[1.7rem] bg-white/25" />
          <div className="min-w-0 flex-1 space-y-3 pt-1">
            <Skeleton className="h-6 w-3/4 rounded-full bg-white/25" />
            <Skeleton className="h-4 w-2/3 rounded-full bg-white/20" />
            <Skeleton className="h-3 w-4/5 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="mt-5 rounded-[1.3rem] bg-white/15 p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24 rounded-full bg-white/20" />
              <Skeleton className="h-5 w-32 rounded-full bg-white/25" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full bg-white/30" />
          </div>
          <Skeleton className="mt-3 h-2 w-full rounded-full bg-white/20" />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-[1.25rem] border border-border bg-card p-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="mt-3 h-3 w-4/5 rounded-full" />
            <Skeleton className="mt-2 h-5 w-2/3 rounded-full" />
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-[1.5rem] border border-border bg-card p-4">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-[8.2rem] rounded-[1.35rem] bg-card p-4 shadow-sm">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="mt-3 h-4 w-3/4 rounded-full" />
            <Skeleton className="mt-2 h-3 w-full rounded-full" />
          </div>
        ))}
      </section>

      <Skeleton className="h-4 w-40 rounded-full" />
      <section className="space-y-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-[1.25rem] border border-border bg-card p-3"
          >
            <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-4/5 rounded-full" />
            </div>
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        ))}
      </section>
    </div>
  );
}

export function CustomerWorkerMatchesSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading recommended workers" aria-busy="true">
      <section className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <div className="-mx-4 flex gap-3 overflow-hidden px-4">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="min-h-[12.5rem] w-[68%] shrink-0 rounded-[1.45rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 p-3.5"
            >
              <div className="flex justify-between">
                <Skeleton className="h-10 w-10 rounded-full bg-white/70" />
                <Skeleton className="h-7 w-14 rounded-full bg-white/70" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-20 rounded-full bg-white/70" />
                <Skeleton className="h-5 w-2/3 rounded-full bg-white/70" />
                <Skeleton className="h-3 w-4/5 rounded-full bg-white/70" />
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full bg-white/70" />
                <Skeleton className="h-6 w-24 rounded-full bg-white/70" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4">
        <Skeleton className="mb-3 h-4 w-44 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-[1.55rem] bg-card p-3.5 shadow-sm"
            >
              <Skeleton className="h-[3.25rem] w-[3.25rem] shrink-0 rounded-[1.15rem]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-4 w-3/5 rounded-full" />
                <Skeleton className="h-3 w-4/5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </section>
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

export function WorkerDetailsSkeleton() {
  return (
    <div
      className="-mx-4 -mt-4 min-h-screen overflow-hidden bg-primary"
      aria-label="Loading worker profile"
      aria-busy="true"
    >
      <div className="px-4 pb-10 pt-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
          <Skeleton className="h-4 w-24 rounded-full bg-white/20" />
          <Skeleton className="h-11 w-11 rounded-full bg-white/20" />
        </div>
        <div className="mt-7 flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-[1.35rem] bg-white/20" />
          <div className="flex-1 space-y-2.5 pt-1">
            <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
            <Skeleton className="h-7 w-3/4 rounded-full bg-white/20" />
            <Skeleton className="h-3 w-2/3 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
          <Skeleton className="h-8 w-28 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="mx-1.5 -mt-3 space-y-4 rounded-t-[2.5rem] bg-background px-4 pb-24 pt-6">
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-[1.25rem]" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-[1.65rem]" />
        <Skeleton className="h-24 rounded-[1.65rem]" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-full" />
          <Skeleton className="h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
