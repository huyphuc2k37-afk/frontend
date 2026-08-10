export default function StoryLoading() {
  return (
    <div className="animate-pulse mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Cover skeleton */}
        <div className="mx-auto h-72 w-48 flex-shrink-0 rounded-2xl bg-gray-200 sm:mx-0" />

        {/* Info skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-8 w-3/4 rounded-lg bg-gray-200" />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-16 rounded-full bg-gray-200" />
            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-2/3 rounded bg-gray-100" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-32 rounded-xl bg-gray-200" />
            <div className="h-10 w-28 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Chapters skeleton */}
      <div className="mt-8 space-y-3">
        <div className="h-6 w-40 rounded bg-gray-200" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
