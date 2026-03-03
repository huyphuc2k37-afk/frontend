export default function GenreLoading() {
  return (
    <div className="animate-pulse mx-auto max-w-7xl px-4 py-6">
      {/* Title */}
      <div className="h-8 w-48 rounded-lg bg-gray-200" />
      <div className="h-4 w-80 rounded bg-gray-100 mt-2" />

      {/* Cards grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 15 }).map((_, i) => (
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
