import Skeleton from '../ui/Skeleton'

// Mirrors the real board layout so the page doesn't jump when data lands.
const BoardSkeleton = () => (
  <div className="mt-6 flex items-start gap-4 overflow-hidden pb-4">
    {[3, 2, 4].map((cards, column) => (
      <div key={column} className="flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ml-auto h-4 w-6" />
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: cards }).map((_, card) => (
            <div key={card} className="rounded-lg bg-white p-3 shadow-sm">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="mt-2 h-3 w-3/5" />
              <Skeleton className="mt-3 h-4 w-16" />
            </div>
          ))}
        </div>

        <Skeleton className="mt-3 h-4 w-24" />
      </div>
    ))}
  </div>
)

export default BoardSkeleton
