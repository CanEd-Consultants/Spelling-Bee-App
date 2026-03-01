import { Skeleton } from "@/components/ui/skeleton"

export default function WordsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>
      <Skeleton className="h-11 w-full" />
      <div className="flex flex-wrap gap-1">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-11 w-11" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-gray-100 bg-white p-4 space-y-3"
          >
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
