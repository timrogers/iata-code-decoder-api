# IATA Code Decoder API - Performance Analysis & Optimization Recommendations

## Executive Summary

Current performance: **2,230 req/sec** (airports with query), **6,197 req/sec** (airlines with query), **734 req/sec** (all airlines)

**Key Findings:**
- ✅ Compression is enabled and working for responses >1KB
- ✅ Cache headers are properly configured (24-hour cache)
- ⚠️ Data transformation happens on every startup (68ms overhead)
- ⚠️ Linear search through 9,027 airports on every request (0.25ms avg)
- ⚠️ No pre-computed indexes for common queries
- ⚠️ Serialization overhead for large result sets (0.5ms for 463 results)
- ⚠️ Full airline list (230KB) returned without query param

---

## Performance Bottlenecks Identified

### 1. **Data Loading & Transformation (Startup Time)**
- **Impact:** Medium (startup only)
- **Current:** 90ms total (22ms parse + 68ms camelCase transformation)
- **Issue:** Data transformation from snake_case to camelCase happens on every server restart

### 2. **Linear Search Algorithm** 
- **Impact:** Low-Medium (0.25ms per search)
- **Current:** 4,000 ops/sec
- **Issue:** `.filter()` iterates through all 9,027 airports on every query
- **With Index:** Can achieve >10M ops/sec (instant lookups)

### 3. **Large Response Serialization**
- **Impact:** Medium (for queries returning many results)
- **Current:** 0.5ms to serialize 463 airports (113KB)
- **Issue:** No result limiting - single character queries can return hundreds of airports

### 4. **Unfiltered Airline Endpoint**
- **Impact:** High (4x slower than filtered)
- **Current:** 734 req/sec vs 6,197 req/sec with query
- **Issue:** `/airlines` without query returns all 847 airlines (230KB response)

### 5. **MCP Server Instance Creation**
- **Impact:** Medium (per new session)
- **Issue:** New MCP server instance created for every initialization
- **Opportunity:** Could be reused or pooled

---

## Optimization Recommendations

### 🟢 QUICK WINS (High Impact, Low Effort)

#### 1. **Pre-transform Data at Build Time** ⭐ TOP PRIORITY
- **Effort:** 1-2 hours
- **Expected Impact:** Eliminate 68ms startup time, reduce memory by ~10%
- **Implementation:**
  ```bash
  # Add to package.json scripts
  "prebuild": "node scripts/transform-data.js"
  ```
  Create script to:
  - Load snake_case JSON files
  - Transform to camelCase
  - Write to `data/transformed/` directory
  - Update imports to use transformed files
  
- **Benefits:**
  - Faster server startup (90ms → 22ms = 75% improvement)
  - Simpler runtime code (remove transformation logic)
  - Reduced memory allocations

#### 2. **Build Prefix Index for Fast Lookups** ⭐ TOP PRIORITY
- **Effort:** 3-4 hours
- **Expected Impact:** 40,000x faster lookups (0.25ms → 0.00001ms)
- **Implementation:**
  ```typescript
  // Build index at startup
  interface PrefixIndex {
    [prefix: string]: Airport[] | Airline[] | Aircraft[];
  }
  
  const buildPrefixIndex = <T extends { iataCode: string }>(
    items: T[], 
    maxLength: number
  ): PrefixIndex => {
    const index: PrefixIndex = {};
    items.forEach(item => {
      const code = item.iataCode.toLowerCase();
      for (let i = 1; i <= Math.min(code.length, maxLength); i++) {
        const prefix = code.substring(0, i);
        if (!index[prefix]) index[prefix] = [];
        index[prefix].push(item);
      }
    });
    return index;
  };
  
  // Use O(1) lookup instead of O(n) filter
  const lookupByPrefix = (index: PrefixIndex, query: string) => {
    return index[query.toLowerCase()] || [];
  };
  ```

- **Memory Cost:** ~6.7MB for airports (3x original size, but worth it)
- **Benefits:**
  - Sub-millisecond response times
  - Can handle much higher request rates
  - Consistent performance regardless of data size

#### 3. **Add Result Limiting**
- **Effort:** 30 minutes
- **Expected Impact:** Prevent large response serialization overhead
- **Implementation:**
  ```typescript
  interface QueryParams {
    query?: string;
    limit?: number; // Default: 50, Max: 100
  }
  
  // In route handlers
  const limit = Math.min(request.query.limit || 50, 100);
  const results = lookupByPrefix(index, query).slice(0, limit);
  return { 
    data: results,
    total: lookupByPrefix(index, query).length,
    returned: results.length 
  };
  ```

#### 4. **Optimize Compression Threshold**
- **Effort:** 15 minutes
- **Expected Impact:** Reduce CPU for small responses
- **Current:** Default threshold (1024 bytes)
- **Implementation:**
  ```typescript
  await app.register(fastifyCompress, {
    threshold: 512, // Compress anything >512 bytes
    encodings: ['gzip', 'deflate'], // Remove br for faster compression
  });
  ```

#### 5. **Add Response Schema Serialization**
- **Effort:** 1-2 hours  
- **Expected Impact:** 2-3x faster JSON serialization
- **Implementation:**
  ```typescript
  // Define strict JSON schemas for responses
  const airportSchema = {
    type: 'object',
    properties: {
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            iataCode: { type: 'string' },
            name: { type: 'string' },
            // ... all fields
          }
        }
      }
    }
  };
  ```
- **Benefits:** Fastify uses fast-json-stringify for 2-3x faster serialization

---

### 🟡 MEDIUM-TERM IMPROVEMENTS (Medium Impact, Medium Effort)

#### 6. **Implement Response Caching Layer**
- **Effort:** 2-3 hours
- **Expected Impact:** 10-100x faster for repeated queries
- **Implementation:**
  ```typescript
  import { LRUCache } from 'lru-cache';
  
  const responseCache = new LRUCache({
    max: 500, // Cache 500 most common queries
    ttl: 1000 * 60 * 60 * 24, // 24 hours
  });
  
  // In route handler
  const cacheKey = `${endpoint}:${query}`;
  let result = responseCache.get(cacheKey);
  if (!result) {
    result = lookupByPrefix(index, query);
    responseCache.set(cacheKey, result);
  }
  ```

#### 7. **Optimize MCP Server Management**
- **Effort:** 2-3 hours
- **Expected Impact:** Reduce memory and initialization overhead
- **Implementation:**
  - Reuse single MCP server instance
  - Implement session pooling
  - Add cleanup for stale sessions (timeout after 1 hour)

#### 8. **Add HTTP/2 Support**
- **Effort:** 1 hour
- **Expected Impact:** Better performance for multiple concurrent requests
- **Implementation:**
  ```typescript
  import { Http2SecureServer } from 'http2';
  
  const app = Fastify({
    http2: true,
    https: {
      // SSL cert config
    }
  });
  ```

#### 9. **Implement Field Filtering**
- **Effort:** 2 hours
- **Expected Impact:** Reduce response sizes by 30-70%
- **Implementation:**
  ```typescript
  interface QueryParams {
    query?: string;
    fields?: string; // Comma-separated: "iataCode,name,city"
  }
  
  // Filter returned fields
  const filterFields = (obj: any, fields: string[]) => {
    return fields.reduce((acc, field) => {
      if (field in obj) acc[field] = obj[field];
      return acc;
    }, {} as any);
  };
  ```

---

### 🔴 LONGER-TERM IMPROVEMENTS (Lower Priority)

#### 10. **Migrate to Binary Serialization**
- **Effort:** 8-10 hours
- **Expected Impact:** 5-10x faster serialization, 50% smaller payloads
- **Options:** MessagePack, Protocol Buffers, or FlatBuffers
- **Trade-off:** Requires client-side changes

#### 11. **Implement Full-Text Search**
- **Effort:** 4-6 hours
- **Expected Impact:** Better search by airport/airline names, not just codes
- **Implementation:** Use MiniSearch or FlexSearch libraries

#### 12. **Add Database Backend**
- **Effort:** 16-20 hours
- **Expected Impact:** Better for very large datasets, real-time updates
- **When:** Only if data grows beyond 100,000 records
- **Options:** SQLite (embedded), PostgreSQL (if need multi-user)

---

## Prioritized Implementation Plan

### Phase 1: Quick Wins (Week 1) - Expected 4-5x performance improvement
1. **Day 1-2:** Pre-transform data at build time (#1)
2. **Day 2-3:** Build prefix index (#2)  
3. **Day 3:** Add result limiting (#3)
4. **Day 4:** Optimize compression (#4)
5. **Day 5:** Add response schema serialization (#5)

**Expected Results:**
- Startup time: 90ms → 22ms
- Search time: 0.25ms → 0.00001ms
- Request rate: 2,200 req/s → 10,000+ req/s
- Large queries: Limited to reasonable sizes

### Phase 2: Medium-Term (Week 2-3) - Additional 2-3x improvement
6. Response caching layer
7. MCP server optimization
8. HTTP/2 support
9. Field filtering

**Expected Results:**
- Cached queries: 100,000+ req/s
- Memory usage: +20MB for cache
- Response sizes: 30-70% smaller

### Phase 3: Future Enhancements (As Needed)
10. Binary serialization (if needed for very high traffic)
11. Full-text search (if users request name search)
12. Database backend (if data grows significantly)

---

## Performance Targets

| Metric | Current | After Phase 1 | After Phase 2 |
|--------|---------|---------------|---------------|
| Startup Time | 90ms | 22ms | 22ms |
| Search Time | 0.25ms | 0.00001ms | 0.00001ms |
| Airports Query | 2,200 req/s | 10,000 req/s | 15,000 req/s |
| Airlines Query | 6,200 req/s | 15,000 req/s | 20,000 req/s |
| All Airlines | 734 req/s | N/A (removed) | N/A |
| Memory Usage | 14MB | 24MB | 44MB |
| p95 Latency | 8ms | 2ms | 1ms |

---

## Metrics to Track

Before/after each optimization, measure:

1. **Request throughput** (req/sec) - Use autocannon
   ```bash
   npx autocannon -c 10 -d 10 http://localhost:3000/airports?query=L
   ```

2. **Response latency** (p50, p95, p99)
   
3. **Memory usage**
   ```bash
   node --expose-gc src/index.js
   # Monitor with: process.memoryUsage()
   ```

4. **Startup time**
   ```bash
   time npm start
   ```

5. **Response sizes** (before/after compression)
   ```bash
   curl -w "%{size_download}\n" -H "Accept-Encoding: gzip" \
     http://localhost:3000/airports?query=L
   ```

---

## Code Examples

### Example: Optimized Data Loading
```typescript
// src/data-loader.ts
import AIRPORTS_DATA from './../data/transformed/airports.json' with { type: 'json' };
import AIRLINES_DATA from './../data/transformed/airlines.json' with { type: 'json' };
import AIRCRAFT_DATA from './../data/transformed/aircraft.json' with { type: 'json' };

// Data is already camelCased, no transformation needed
export const AIRPORTS: Airport[] = AIRPORTS_DATA;
export const AIRLINES: Airline[] = AIRLINES_DATA;
export const AIRCRAFT: Aircraft[] = AIRCRAFT_DATA;

// Build indexes at startup
export const AIRPORT_INDEX = buildPrefixIndex(AIRPORTS, 3);
export const AIRLINE_INDEX = buildPrefixIndex(AIRLINES, 2);
export const AIRCRAFT_INDEX = buildPrefixIndex(AIRCRAFT, 3);

console.log('✅ Data loaded and indexed in', Date.now() - startTime, 'ms');
```

### Example: Optimized Route Handler
```typescript
app.get<{ Querystring: QueryParams }>(
  '/airports',
  {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
        }
      },
      response: {
        200: airportResponseSchema // Fast serialization
      }
    }
  },
  async (request, reply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    if (!request.query.query) {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    }

    const query = request.query.query;
    if (query.length > 3) {
      return { data: [], total: 0, returned: 0 };
    }

    // O(1) index lookup instead of O(n) filter
    const results = AIRPORT_INDEX[query.toLowerCase()] || [];
    const limit = request.query.limit || 50;
    
    return {
      data: results.slice(0, limit),
      total: results.length,
      returned: Math.min(results.length, limit)
    };
  }
);
```

---

## Testing Plan

1. **Unit Tests:** Test index building and lookups
2. **Integration Tests:** Test all endpoints with various queries
3. **Performance Tests:** Benchmark before/after each change
4. **Load Tests:** Test with 100+ concurrent connections
5. **Memory Tests:** Monitor for memory leaks over time

---

## Conclusion

The API is already well-structured with good fundamentals (Fastify, compression, caching). The recommended optimizations focus on:

1. **Eliminating runtime overhead** (pre-transform data)
2. **Replacing O(n) with O(1) lookups** (prefix indexes)
3. **Controlling response sizes** (limits, field filtering)
4. **Leveraging Fastify's performance features** (schema serialization, HTTP/2)

**Expected overall improvement: 5-10x throughput, 70-80% latency reduction**

Implementation of Phase 1 alone should provide significant benefits with minimal risk and reasonable effort (1 week).
