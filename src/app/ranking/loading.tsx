export default function RankingLoading() {
  return (
    <div className="animate-pulse mx-auto max-w-7xl px-4 py-6">
      {/* Title */}
      <div className="h-8 w-56 rounded-lg bg-gray-200" />

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-gray-200" />
        ))}
      </div>

      {/* Ranking list */}
      <div className="mt-6 space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-gray-100 p-4">
            <div className="h-6 w-6 rounded bg-gray-200" />
            <div className="h-16 w-12 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
