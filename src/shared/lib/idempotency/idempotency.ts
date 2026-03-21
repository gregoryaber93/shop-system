const CACHE_TTL_MS = 60 * 60 * 1000;

interface CachedEntry<T> {
  timestamp: number;
  result: T;
}

const idempotencyCache = new Map<string, CachedEntry<unknown>>();

const cleanupExpired = () => {
  const now = Date.now();

  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
};

export const generateIdempotencyKey = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const cacheIdempotentResult = <T>(key: string, result: T): void => {
  cleanupExpired();
  idempotencyCache.set(key, {
    timestamp: Date.now(),
    result,
  });
};

export const getIdempotentResult = <T>(key: string): T | null => {
  cleanupExpired();

  const entry = idempotencyCache.get(key) as CachedEntry<T> | undefined;
  return entry?.result ?? null;
};

export const clearIdempotencyCache = (): void => {
  idempotencyCache.clear();
};
