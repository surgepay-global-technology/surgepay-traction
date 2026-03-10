/**
 * Lightweight in-memory TTL cache for API routes.
 * Prevents repeated full-table scans within the dashboard refresh window.
 * Cache lives for the lifetime of the Node process (cleared on deploy/restart).
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Cache-aside helper. Runs `fn` only on a cache miss.
 * TTL defaults to 90 seconds — fresh on every 2-minute dashboard refresh.
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 90_000,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== null) return cached;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}
