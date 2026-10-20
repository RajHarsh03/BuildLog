import { unstable_cache } from "next/cache";

/**
 * Drop-in wrapper around `unstable_cache` that becomes a plain pass-through
 * in development.
 *
 * Why: Next's dev server holds unstable_cache entries in memory and
 * `revalidateTag` from API route handlers does not reliably clear them there,
 * so local admin edits stay invisible on public pages until the revalidate
 * window lapses (verified: direct DB writes never showed up on dev's home).
 * Development reads therefore skip the cache entirely - always fresh from
 * Mongo, which is the whole point of a dev loop. Production keeps the exact
 * tagged-cache behavior.
 */
export function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  id: string[],
  opts: { tags: string[]; revalidate: number },
): (...args: A) => Promise<R> {
  if (process.env.NODE_ENV === "development") return fn;
  return unstable_cache(fn, id, opts);
}
