const snakeCaseToCamelCase = (string: string): string =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

export const cameliseKeys = (object: object): object =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

// Performance optimization: Create Maps for O(1) direct lookups
export class OptimizedLookup<T extends { iataCode: string }> {
  private readonly directMap = new Map<string, T>();
  private readonly prefixMap = new Map<string, T[]>();
  private readonly items: T[];

  constructor(items: T[], maxCodeLength: number) {
    this.items = items;
    
    // Build direct lookup map
    for (const item of items) {
      this.directMap.set(item.iataCode.toLowerCase(), item);
    }

    // Build prefix maps for efficient prefix search
    for (let prefixLength = 1; prefixLength <= maxCodeLength; prefixLength++) {
      const prefixItems = new Map<string, T[]>();
      
      for (const item of items) {
        const prefix = item.iataCode.toLowerCase().substring(0, prefixLength);
        if (!prefixItems.has(prefix)) {
          prefixItems.set(prefix, []);
        }
        prefixItems.get(prefix)!.push(item);
      }
      
      prefixItems.forEach((value, key) => {
        this.prefixMap.set(key, value);
      });
    }
  }

  // O(1) direct lookup
  getByCode(code: string): T | undefined {
    return this.directMap.get(code.toLowerCase());
  }

  // Optimized prefix search
  searchByPrefix(prefix: string, maxCodeLength: number): T[] {
    if (prefix.length > maxCodeLength) {
      return [];
    }
    
    const normalizedPrefix = prefix.toLowerCase();
    return this.prefixMap.get(normalizedPrefix) || [];
  }

  // Get all items
  getAll(): T[] {
    return this.items;
  }
}

// Simple in-memory cache for response caching
export class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly ttl: number;

  constructor(ttlSeconds: number = 300) { // 5 minutes default
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
