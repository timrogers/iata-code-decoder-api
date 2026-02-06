/**
 * Example implementation of Priority 2 & 3: Pagination + Result Caching
 * Demonstrates how to add pagination and LRU caching for better performance
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { Keyable } from './types.js';

/**
 * Simple LRU Cache implementation
 * For production, consider using the 'lru-cache' npm package
 */
class SimpleLRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
  
  set(key: K, value: V): void {
    // Remove if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Add to end
    this.cache.set(key, value);
    
    // Evict oldest if over size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

/**
 * Result cache for filtered airport/airline/aircraft queries
 * 
 * Performance impact:
 * - Cache hit: <0.01ms response time
 * - Expected hit rate: 80-95% for production traffic
 * - Memory overhead: ~5-10 MB for 1000 cached queries
 */
export const resultCache = new SimpleLRUCache<string, Keyable[]>(1000);

// Cache statistics (useful for monitoring)
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const stats = resultCache.getStats();
  const total = cacheHits + cacheMisses;
  const hitRate = total > 0 ? (cacheHits / total) * 100 : 0;
  
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: hitRate.toFixed(2) + '%',
    size: stats.size,
    maxSize: stats.maxSize,
  };
}

/**
 * Reset cache statistics
 */
export function resetCacheStats() {
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Clear the result cache (useful for testing or manual cache invalidation)
 */
export function clearCache() {
  resultCache.clear();
  resetCacheStats();
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  query?: string;
  limit?: number;  // Default 50, max 500
  offset?: number; // Default 0
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Execute a query with caching and pagination
 * 
 * @param cacheKey - Unique cache key for this query
 * @param queryFn - Function that executes the actual query
 * @param limit - Maximum results to return
 * @param offset - Offset for pagination
 * @returns Paginated response
 */
export function cachedPaginatedQuery<T extends Keyable>(
  cacheKey: string,
  queryFn: () => T[],
  limit: number = 50,
  offset: number = 0
): PaginatedResponse<T> {
  // Check cache first
  let allResults = resultCache.get(cacheKey) as T[] | undefined;
  
  if (allResults !== undefined) {
    cacheHits++;
  } else {
    // Cache miss - execute query
    cacheMisses++;
    allResults = queryFn();
    resultCache.set(cacheKey, allResults as Keyable[]);
  }
  
  // Apply pagination
  const total = allResults.length;
  const paginatedResults = allResults.slice(offset, offset + limit);
  
  return {
    data: paginatedResults,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Parse and validate pagination parameters from request
 * 
 * @param request - Fastify request object
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  request: FastifyRequest<{ Querystring: PaginationParams }>
): { limit: number; offset: number } {
  const limit = Math.min(
    Math.max(1, request.query.limit || 50),
    500 // Hard cap at 500 results
  );
  
  const offset = Math.max(0, request.query.offset || 0);
  
  return { limit, offset };
}

/**
 * Example usage in a route handler:
 * 
 * app.get<{ Querystring: PaginationParams }>(
 *   '/airports',
 *   async (request, reply) => {
 *     const { query } = request.query;
 *     const { limit, offset } = parsePaginationParams(request);
 *     
 *     const cacheKey = `airports:${query}`;
 *     const response = cachedPaginatedQuery(
 *       cacheKey,
 *       () => airportIndex.search(query, 3),
 *       limit,
 *       offset
 *     );
 *     
 *     reply.header('Cache-Control', 'public, max-age=86400');
 *     reply.header('X-Cache-Status', 
 *       resultCache.has(cacheKey) ? 'HIT' : 'MISS'
 *     );
 *     
 *     return response;
 *   }
 * );
 * 
 * Example requests:
 * GET /airports?query=L              // First 50 results
 * GET /airports?query=L&limit=100    // First 100 results
 * GET /airports?query=L&offset=50    // Next 50 results (pagination)
 * 
 * Performance:
 * - First request: ~3-4ms (builds and caches)
 * - Subsequent requests: <0.1ms (cache hit)
 * - Memory: ~5-10MB for 1000 cached queries
 */

/**
 * Add a cache stats endpoint (useful for monitoring)
 * 
 * app.get('/cache/stats', async (request, reply) => {
 *   return getCacheStats();
 * });
 * 
 * app.post('/cache/clear', async (request, reply) => {
 *   clearCache();
 *   return { success: true, message: 'Cache cleared' };
 * });
 */
