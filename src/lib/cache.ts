// Global Cache Singleton matching Redis interface

interface CacheProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
}

class InMemoryCache implements CacheProvider {
  private store = new Map<string, { value: any; expiry: number | null }>();

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiry });
  }
}

// Fallback to in-memory Cache Provider
const globalCacheKey = Symbol.for("cashix.marketCache");
const globalSymbols = Object.getOwnPropertySymbols(globalThis);
const hasCache = globalSymbols.indexOf(globalCacheKey) > -1;

if (!hasCache) {
  (globalThis as any)[globalCacheKey] = new InMemoryCache();
}

export const cache: CacheProvider = (globalThis as any)[globalCacheKey];
