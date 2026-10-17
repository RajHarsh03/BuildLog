/** Route-level fallback shown while the case-study page streams in. */
export default function ProjectDetailLoading() {
  return (
    <div className="w-full px-5 sm:px-8 py-8 max-w-7xl mx-auto">
      <div className="animate-pulse space-y-4 mb-10" aria-hidden>
        <div className="h-4 w-40 rounded bg-surface-container" />
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-surface-container" />
          <div className="space-y-3 flex-1">
            <div className="h-12 w-3/5 rounded bg-surface-container" />
            <div className="h-5 w-2/5 rounded bg-surface-container/70" />
          </div>
          <div className="h-8 w-24 rounded bg-surface-container" />
        </div>
      </div>

      {/* Hero panel */}
      <div className="animate-pulse h-64 sm:h-80 rounded-lg bg-surface-container/60 border-2 border-on-surface/10 mb-8" aria-hidden />

      {/* CTA + meta strip */}
      <div className="animate-pulse flex flex-wrap gap-3 mb-10" aria-hidden>
        <div className="h-10 w-36 rounded bg-surface-container" />
        <div className="h-10 w-32 rounded bg-surface-container" />
        <div className="ml-auto flex gap-2">
          <div className="h-10 w-20 rounded bg-surface-container/60" />
          <div className="h-10 w-24 rounded bg-surface-container/60" />
        </div>
      </div>

      {/* Case-study sections */}
      <div className="animate-pulse grid grid-cols-1 lg:grid-cols-12 gap-8" aria-hidden>
        <div className="lg:col-span-8 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-7 w-44 rounded bg-surface-container" />
              <div className="h-4 w-full rounded bg-surface-container/60" />
              <div className="h-4 w-full rounded bg-surface-container/60" />
              <div className="h-4 w-3/4 rounded bg-surface-container/60" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 space-y-3">
          <div className="h-6 w-28 rounded bg-surface-container" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-surface-container/60" style={{ width: `${95 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
