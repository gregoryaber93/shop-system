interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const CACHE_KEY = {
  productsAll: "cache:products:all",
  productsByShop: "cache:products:shop:",
  productDetail: "cache:products:detail:",
  promotionsActive: "cache:promotions:active",
  userProfile: "cache:user:profile",
} as const;

const isBrowser = (): boolean => typeof window !== "undefined";

export const cacheGet = <T>(key: string, expiryMs: number): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.timestamp > expiryMs) {
      window.localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

export const cacheSet = <T>(key: string, data: T): void => {
  if (!isBrowser()) {
    return;
  }

  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  window.localStorage.setItem(key, JSON.stringify(entry));
};

export const cacheRemove = (key: string): void => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
};

export const cacheClearByPrefix = (prefix: string): void => {
  if (!isBrowser()) {
    return;
  }

  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => {
      window.localStorage.removeItem(key);
    });
};

export const clearAppCaches = (): void => {
  cacheRemove(CACHE_KEY.productsAll);
  cacheRemove(CACHE_KEY.promotionsActive);
  cacheRemove(CACHE_KEY.userProfile);
  cacheClearByPrefix(CACHE_KEY.productsByShop);
  cacheClearByPrefix(CACHE_KEY.productDetail);
};