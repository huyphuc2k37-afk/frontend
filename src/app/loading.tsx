export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="h-[240px] sm:h-[280px] rounded-2xl bg-gray-200" />
      </div>

      {/* Section title */}
      <div className="mx-auto max-w-7xl px-4 mt-8">
        <div className="h-7 w-48 rounded-lg bg-gray-200" />
      </div>

      {/* Story cards grid */}
      <div className="mx-auto max-w-7xl px-4 mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[3/4] rounded-xl bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
