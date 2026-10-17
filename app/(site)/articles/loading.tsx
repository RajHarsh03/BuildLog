/** Route-level fallback shown while the articles query streams in. */
function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse bg-surface-container-lowest border-2 border-on-surface rounded-lg p-5 space-y-4"
    >
      <div className="h-5 w-24 rounded bg-surface-container" />
      <div className="h-6 w-full rounded bg-surface-container" />
      <div className="h-6 w-3/4 rounded bg-surface-container" />
      <div className="h-4 w-full rounded bg-surface-container/70" />
      <div className="h-4 w-2/3 rounded bg-surface-container/70" />
      <div className="flex items-center gap-3 pt-2">
        <div className="h-8 w-8 rounded-full bg-surface-container" />
        <div className="h-3 w-20 rounded bg-surface-container" />
        <div className="h-3 w-14 rounded bg-surface-container ml-auto" />
      </div>
    </div>
  );
}

export default function ArticlesLoading() {
  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="animate-pulse space-y-4 mb-8" aria-hidden>
        <div className="h-4 w-32 rounded bg-surface-container" />
        <div className="h-10 w-72 rounded bg-surface-container" />
        <div className="h-4 w-full max-w-2xl rounded bg-surface-container/70" />
      </div>
      {/* Filter bar */}
      <div className="animate-pulse flex flex-wrap gap-2 mb-8" aria-hidden>
        {[96, 128, 112, 144, 80].map((w, i) => (
          <div key={i} className="h-8 rounded bg-surface-container" style={{ width: w }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
