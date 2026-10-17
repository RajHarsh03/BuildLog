/** Route-level fallback shown while the projects query streams in. */
function ProjectSkeleton() {
  return (
    <div
      aria-hidden
      className="animate-pulse md:col-span-6 bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[4px_4px_0px_0px_var(--color-ink)] p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded bg-surface-container" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-1/2 rounded bg-surface-container" />
          <div className="h-3 w-1/3 rounded bg-surface-container/70" />
        </div>
        <div className="h-6 w-16 rounded bg-surface-container" />
      </div>
      <div className="h-32 rounded-lg bg-surface-container/60" />
      <div className="h-4 w-full rounded bg-surface-container/70" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded bg-surface-container" />
        <div className="h-6 w-20 rounded bg-surface-container" />
        <div className="h-6 w-14 rounded bg-surface-container" />
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="w-full px-5 sm:px-8 py-8">
      <div className="animate-pulse space-y-4 mb-8" aria-hidden>
        <div className="h-4 w-32 rounded bg-surface-container" />
        <div className="h-10 w-80 rounded bg-surface-container" />
        <div className="h-4 w-full max-w-2xl rounded bg-surface-container/70" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
