/** Route-level fallback shown while the article + MDX render streams in. */
export default function ArticleDetailLoading() {
  return (
    <div className="w-full px-5 sm:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="animate-pulse space-y-4 mb-10" aria-hidden>
        <div className="h-4 w-40 rounded bg-surface-container" />
        <div className="h-12 w-4/5 max-w-3xl rounded bg-surface-container" />
        <div className="h-5 w-1/2 max-w-xl rounded bg-surface-container/70" />
        <div className="flex items-center gap-3 pt-2">
          <div className="h-9 w-9 rounded-full bg-surface-container" />
          <div className="h-4 w-28 rounded bg-surface-container" />
          <div className="h-4 w-20 rounded bg-surface-container/70 ml-auto" />
        </div>
      </div>

      {/* Body: sticky rail + prose (mirrors the 12-col layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="hidden lg:block lg:col-span-4 animate-pulse space-y-3" aria-hidden>
          <div className="h-4 w-24 rounded bg-surface-container" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 rounded bg-surface-container/60" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>
        <div className="lg:col-span-8 animate-pulse space-y-5" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-1/3 rounded bg-surface-container" />
              <div className="h-4 w-full rounded bg-surface-container/60" />
              <div className="h-4 w-full rounded bg-surface-container/60" />
              <div className="h-4 w-4/5 rounded bg-surface-container/60" />
            </div>
          ))}
          <div className="h-40 rounded-lg bg-surface-container/50 border-2 border-on-surface/10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded bg-surface-container/60" />
              <div className="h-4 w-2/3 rounded bg-surface-container/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
