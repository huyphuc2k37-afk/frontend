export default function ChapterLoading() {
  return (
    <div className="animate-pulse mx-auto max-w-3xl px-4 py-8">
      {/* Chapter title */}
      <div className="h-7 w-2/3 rounded-lg bg-gray-200 mx-auto" />
      <div className="h-4 w-40 rounded bg-gray-100 mx-auto mt-2" />

      {/* Content lines */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-gray-100"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}
