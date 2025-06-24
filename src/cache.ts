import { LRUCache } from 'lru-cache';

interface CacheOptions {
  maxSize: number;
  ttl: number;
}

class APICache {
  private cache: LRUCache<string, any>;

  constructor(options: CacheOptions) {
    this.cache = new LRUCache({
      max: options.maxSize,
      ttl: options.ttl,
    });
  }

  get(key: string): any | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  generateKey(prefix: string, query: string): string {
    return `${prefix}:${query.toLowerCase()}`;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Create cache instances with different configurations
export const searchCache = new APICache({
  maxSize: 1000, // Store up to 1000 search results
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

export const staticCache = new APICache({
  maxSize: 100, // Smaller cache for static content
  ttl: 1000 * 60 * 60, // 1 hour TTL
});