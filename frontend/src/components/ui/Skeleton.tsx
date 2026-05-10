export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-3 rounded animate-pulse ${className}`} />
  )
}

export function JobRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-2.5 w-32" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-12" />
    </div>
  )
}

export function ResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-4/6" />
      </div>
      <div className="card p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-4 w-10" /></div>
          <div className="space-y-1.5"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-4 w-10" /></div>
          <div className="space-y-1.5"><Skeleton className="h-2.5 w-16" /><Skeleton className="h-4 w-10" /></div>
        </div>
      </div>
    </div>
  )
}
