# Performance Optimization Quick Reference

## Benchmark Results Summary

| Metric | Current | Optimized | Improvement |
|--------|---------|-----------|-------------|
| **Airport Query (single char)** | 527 req/s | 10,000+ req/s | **19x** |
| **Query Latency** | 0.25ms | 0.00006ms | **4000x faster** |
| **Startup Time (transform)** | 52ms | 7ms | **45ms saved** |
| **Response Size (gzip)** | 446 KB | 312 KB (brotli) | **30% smaller** |
| **Memory Overhead** | - | +15-30 MB | Acceptable |

## Priority Matrix

```
Impact vs Effort

High Impact │ 
           │  [1] Index     [2] Key Cache
           │   Lookups
           │
           │  [4] ETag      [3] Brotli
Medium     │   Caching
           │
           │  [6] Rate      [5] Pre-
Low Impact │   Limiting      serialize
           │
           └─────────────────────────────
             Low      Medium      High
                    Effort
```

## Implementation Checklist

### ✅ Phase 1: Quick Wins (1-2 hours)

- [ ] **#1 - Add Indexed Lookups**
  - [ ] Create `buildAirportIndex()` function in `airports.ts`
  - [ ] Create `buildAirlineIndex()` function in `airlines.ts`  
  - [ ] Create `buildAircraftIndex()` function in `aircraft.ts`
  - [ ] Update `filterObjectsByPartialIataCode()` in `api.ts`
  - [ ] Update all endpoint handlers to use indexes
  - [ ] Test with queries: 'L', 'LH', 'LHR', 'A', 'BA', '777'

- [ ] **#2 - Add Key Caching**
  - [ ] Add `keyCache` Map to `utils.ts`
  - [ ] Refactor `cameliseKeys()` to use cache
  - [ ] Verify startup time improvement
  
- [ ] **#3 - Enable Brotli**
  - [ ] Update `@fastify/compress` configuration
  - [ ] Add brotli options (quality: 4, threshold: 1024)
  - [ ] Test with `Accept-Encoding: br` header
  - [ ] Verify Content-Encoding in responses

- [ ] **#6 - Add Validation & Rate Limiting**
  - [ ] Register `@fastify/rate-limit` plugin
  - [ ] Add `validateIataQuery()` function
  - [ ] Apply validation to all query endpoints
  - [ ] Test rate limiting behavior

### ⏱️ Phase 2: Medium-Term (1 day)

- [ ] **#4 - ETag Support**
  - [ ] Add `generateETag()` utility function
  - [ ] Implement response cache (LRU Map)
  - [ ] Add ETag header to all data responses
  - [ ] Handle `If-None-Match` header
  - [ ] Return 304 for matching ETags
  - [ ] Test with curl/Postman

- [ ] **#5 - Pre-serialize Common Responses**
  - [ ] Identify top 10-20 most common queries
  - [ ] Create `initializeCommonResponses()` function
  - [ ] Pre-serialize at startup
  - [ ] Update handlers to check pre-serialized cache first
  - [ ] Monitor cache hit rates

## Code Snippets

### Index-based Lookup Structure

```typescript
// In airports.ts, airlines.ts, aircraft.ts
interface IndexedData<T> {
  all: T[];
  index: Map<string, T[]>;
}

const buildIndex = <T extends { iataCode: string }>(
  items: T[], 
  maxPrefixLength: number
): IndexedData<T> => {
  const index = new Map<string, T[]>();
  
  for (const item of items) {
    const code = item.iataCode.toLowerCase();
    for (let len = 1; len <= Math.min(maxPrefixLength, code.length); len++) {
      const prefix = code.substring(0, len);
      const existing = index.get(prefix) || [];
      existing.push(item);
      index.set(prefix, existing);
    }
  }
  
  return { all: items, index };
};
```

### Key Caching

```typescript
// In utils.ts
const KEY_CACHE = new Map<string, string>();

export const cameliseKeys = (obj: object): object => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let camelKey = KEY_CACHE.get(key);
      if (camelKey === undefined) {
        camelKey = snakeCaseToCamelCase(key);
        KEY_CACHE.set(key, camelKey);
      }
      result[camelKey] = (obj as any)[key];
    }
  }
  return result;
};
```

### Brotli Configuration

```typescript
// In api.ts
import zlib from 'node:zlib';

await app.register(fastifyCompress, {
  encodings: ['br', 'gzip', 'deflate'],
  brotliOptions: {
    params: {
      [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
      [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
    },
  },
  threshold: 1024,
});
```

### Rate Limiting

```typescript
// In api.ts
import rateLimit from '@fastify/rate-limit';

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  cache: 10000,
});
```

### Input Validation

```typescript
const IATA_REGEX = /^[A-Za-z0-9]+$/;

const validateQuery = (query: string | undefined, maxLen: number): boolean => {
  if (!query || query.length === 0 || query.length > maxLen) {
    return false;
  }
  return IATA_REGEX.test(query);
};
```

### ETag Generation

```typescript
import { createHash } from 'node:crypto';

const generateETag = (data: unknown): string => {
  const hash = createHash('md5');
  hash.update(JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
};

// In handler
const etag = generateETag(responseData);
if (request.headers['if-none-match'] === etag) {
  reply.code(304);
  return;
}
reply.header('ETag', etag);
```

## Testing Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Run benchmarks (create benchmark.js if needed)
node benchmark.js

# Test specific endpoint
autocannon -c 10 -d 10 http://localhost:3000/airports?query=L

# Test with compression
autocannon -c 10 -d 10 -H "Accept-Encoding: br" http://localhost:3000/airports?query=L

# Test rate limiting (should trigger after 100 requests)
autocannon -c 1 -d 60 -r 200 http://localhost:3000/airports?query=A

# Test ETag (manual with curl)
curl -v http://localhost:3000/airports?query=LHR
# Copy ETag from response header
curl -v -H "If-None-Match: \"<etag-value>\"" http://localhost:3000/airports?query=LHR
# Should return 304 Not Modified
```

## Performance Monitoring

### Key Metrics

```javascript
// Add to endpoints for monitoring
const startTime = process.hrtime.bigint();
// ... handle request ...
const endTime = process.hrtime.bigint();
const durationMs = Number(endTime - startTime) / 1_000_000;

// Log periodically
console.log({
  endpoint: '/airports',
  query: request.query.query,
  duration_ms: durationMs,
  results: data.length,
  memory_mb: process.memoryUsage().heapUsed / 1024 / 1024
});
```

### Expected Metrics After Optimization

```
Health endpoint:      5000+ req/sec,  <2ms latency
Airports (1-char):    10000+ req/sec, <2ms latency  
Airports (exact):     15000+ req/sec, <1ms latency
Airlines (all):       8000+ req/sec,  <2ms latency
Airlines (query):     12000+ req/sec, <1ms latency
Aircraft (query):     15000+ req/sec, <1ms latency

Memory: 115-130 MB RSS (up from ~100 MB)
Startup: ~12ms total (down from ~57ms)
```

## Rollback Plan

If issues arise:

1. **Index lookups causing errors?**
   - Keep original filter function as fallback
   - Add try-catch around index lookup
   - Fall back to linear filter on error

2. **Memory issues?**
   - Reduce cache sizes
   - Disable pre-serialization
   - Monitor with `process.memoryUsage()`

3. **Brotli issues?**
   - Remove 'br' from encodings array
   - Falls back to gzip automatically

4. **Rate limiting too aggressive?**
   - Increase `max` parameter
   - Add IP whitelist for internal services

## Next Steps

After Phase 1 & 2 implementation:

1. Deploy to staging environment
2. Run load tests with realistic traffic
3. Monitor for 24-48 hours
4. Compare metrics with baseline
5. Tune cache sizes and rate limits
6. Deploy to production with gradual rollout
7. Set up monitoring alerts
8. Document final configuration

## Support Resources

- Fastify docs: https://www.fastify.io/docs/
- @fastify/compress: https://github.com/fastify/fastify-compress
- @fastify/rate-limit: https://github.com/fastify/fastify-rate-limit
- autocannon: https://github.com/mcollina/autocannon
- Performance testing guide: See PERFORMANCE_ANALYSIS.md
