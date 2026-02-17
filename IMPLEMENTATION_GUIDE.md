# Quick Start: Performance Optimization Implementation Guide

This guide provides step-by-step instructions to implement the highest-impact performance optimizations for the IATA Code Decoder API.

## 📊 Current Performance Baseline

- **Airports (query=LH):** 2,230 req/sec, 4ms avg latency
- **Airlines (query=BA):** 6,197 req/sec, 1ms avg latency  
- **All Airlines:** 734 req/sec, 13ms avg latency
- **Startup time:** ~90ms (22ms parse + 68ms transformation)

## 🎯 Expected Results After Optimizations

- **Throughput:** 5-10x improvement (10,000+ req/sec)
- **Latency:** 70-80% reduction (sub-millisecond for most queries)
- **Startup time:** 75% faster (90ms → 22ms)
- **Memory usage:** +20-30MB (worth it for the performance gain)

---

## Implementation Steps

### Step 1: Pre-transform Data (30 minutes)

**What:** Eliminate runtime camelCase transformation by pre-transforming data at build time.

**Files to modify:**
- `package.json` - Add prebuild script
- `scripts/transform-data.js` - Already created
- `src/airports.ts`, `src/airlines.ts`, `src/aircraft.ts` - Update imports

#### 1.1 Update package.json

```json
{
  "scripts": {
    "prebuild": "node scripts/transform-data.js",
    "build": "tsc",
    "prestart": "node scripts/transform-data.js",
    // ... existing scripts
  }
}
```

#### 1.2 Run transformation

```bash
node scripts/transform-data.js
```

This creates `data/transformed/` directory with pre-transformed JSON files.

#### 1.3 Update data loaders

**src/airports.ts:**
```typescript
import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/transformed/airports.json' with { type: 'json' };

// No transformation needed - data is already camelCased
export const AIRPORTS: Airport[] = AIRPORTS_DATA;
```

**src/airlines.ts:**
```typescript
import { Airline } from './types.js';
import AIRLINES_DATA from './../data/transformed/airlines.json' with { type: 'json' };

// Data is already filtered and transformed
export const AIRLINES: Airline[] = AIRLINES_DATA;
```

**src/aircraft.ts:**
```typescript
import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/transformed/aircraft.json' with { type: 'json' };

export const AIRCRAFT: Aircraft[] = AIRCRAFT_DATA;
```

#### 1.4 Remove unused utils

The `cameliseKeys` function in `src/utils.ts` is no longer needed and can be removed.

---

### Step 2: Implement Prefix Indexing (1-2 hours)

**What:** Replace O(n) linear search with O(1) hash map lookups.

**Files to use:**
- `src/indexer.ts` - Already created with helper functions

#### 2.1 Build indexes at startup

Add to **src/api.ts** (after imports):

```typescript
import { buildPrefixIndex, lookupByPrefix, getIndexStats } from './indexer.js';

// Build indexes at module load time
const startTime = Date.now();
const AIRPORT_INDEX = buildPrefixIndex(AIRPORTS, 3);
const AIRLINE_INDEX = buildPrefixIndex(AIRLINES, 2);
const AIRCRAFT_INDEX = buildPrefixIndex(AIRCRAFT, 3);
console.log(`✅ Indexes built in ${Date.now() - startTime}ms`);

// Optional: Log index statistics
if (process.env.NODE_ENV !== 'production') {
  console.log('Airport Index:', getIndexStats(AIRPORT_INDEX));
  console.log('Airline Index:', getIndexStats(AIRLINE_INDEX));
  console.log('Aircraft Index:', getIndexStats(AIRCRAFT_INDEX));
}
```

#### 2.2 Replace filter with index lookup

**Original code:**
```typescript
const airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
```

**New code:**
```typescript
const airports = lookupByPrefix(AIRPORT_INDEX, query, 3);
```

Apply this change to:
- `/airports` endpoint (line ~295)
- `/airlines` endpoint (line ~319)
- `/aircraft` endpoint (line ~347)
- MCP tools: `lookup_airport` (line ~125), `lookup_airline` (line ~145), `lookup_aircraft` (line ~165)

#### 2.3 Remove old filter function

The `filterObjectsByPartialIataCode` function (lines 200-212) can be removed.

---

### Step 3: Add Result Limiting (30 minutes)

**What:** Prevent large responses by limiting results.

#### 3.1 Update query interface

```typescript
interface QueryParams {
  query?: string;
  limit?: number; // Add this
}
```

#### 3.2 Update query schema

```typescript
const queryStringSchema = {
  type: 'object',
  properties: {
    query: { type: 'string' },
    limit: { 
      type: 'integer', 
      minimum: 1, 
      maximum: 100, 
      default: 50 
    },
  },
};
```

#### 3.3 Apply limit in handlers

```typescript
const query = request.query.query;
const limit = request.query.limit || 50;

const allResults = lookupByPrefix(AIRPORT_INDEX, query, 3);
const results = allResults.slice(0, limit);

return { 
  data: results,
  total: allResults.length,    // Total matching
  returned: results.length      // Returned in response
};
```

#### 3.4 Update response schemas

```typescript
const dataResponseSchema = {
  type: 'object',
  properties: {
    data: { type: 'array' },
    total: { type: 'number' },
    returned: { type: 'number' },
  },
};
```

---

### Step 4: Optimize Compression (5 minutes)

**What:** Fine-tune compression settings for better CPU/bandwidth trade-off.

Update the compression registration:

```typescript
await app.register(fastifyCompress, {
  threshold: 512,                    // Compress responses > 512 bytes
  encodings: ['gzip', 'deflate'],   // Remove brotli (slower)
  zlibOptions: {
    level: 6                         // Default is 9, 6 is faster with similar compression
  }
});
```

---

### Step 5: Add Fast JSON Serialization (1 hour)

**What:** Use Fastify's fast-json-stringify for 2-3x faster serialization.

Define detailed response schemas for each endpoint:

```typescript
const airportResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          iataCode: { type: 'string' },
          icaoCode: { type: 'string' },
          name: { type: 'string' },
          cityName: { type: 'string' },
          iataCountryCode: { type: 'string' },
          iataCity Code: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          timeZone: { type: 'string' },
          city: {
            type: ['object', 'null'],
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              iataCode: { type: 'string' },
              iataCountryCode: { type: 'string' },
            }
          }
        }
      }
    },
    total: { type: 'number' },
    returned: { type: 'number' },
  },
};

const airlineResponseSchema = {
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
        }
      }
    },
    total: { type: 'number' },
    returned: { type: 'number' },
  },
};

const aircraftResponseSchema = {
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
        }
      }
    },
    total: { type: 'number' },
    returned: { type: 'number' },
  },
};
```

Then use in route schemas:

```typescript
app.get<{ Querystring: QueryParams }>(
  '/airports',
  {
    schema: {
      querystring: queryStringSchema,
      response: {
        200: airportResponseSchema,  // Use specific schema
        400: errorResponseSchema,
      },
    },
  },
  // ... handler
);
```

---

### Step 6: Fix Airlines Endpoint (5 minutes)

**What:** Remove the ability to fetch all airlines (performance killer).

Change the `/airlines` endpoint to always require a query:

```typescript
app.get<{ Querystring: QueryParams }>(
  '/airlines',
  // ...
  async (request, reply) => {
    reply.header('Content-Type', 'application/json');
    reply.header('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);

    // Now required (no longer optional)
    if (request.query.query === undefined || request.query.query === '') {
      reply.code(400);
      return QUERY_MUST_BE_PROVIDED_ERROR;
    }

    const query = request.query.query;
    const limit = request.query.limit || 50;
    
    const allResults = lookupByPrefix(AIRLINE_INDEX, query, 2);
    const results = allResults.slice(0, limit);

    return {
      data: results,
      total: allResults.length,
      returned: results.length,
    };
  }
);
```

---

## Testing

### 1. Unit Tests

Add tests for the indexer:

```typescript
// __tests__/indexer.test.ts
import { buildPrefixIndex, lookupByPrefix } from '../src/indexer';

describe('Prefix Indexer', () => {
  const testData = [
    { iataCode: 'LHR', name: 'Heathrow' },
    { iataCode: 'LGW', name: 'Gatwick' },
    { iataCode: 'LCY', name: 'London City' },
    { iataCode: 'JFK', name: 'JFK' },
  ];

  it('should build index correctly', () => {
    const index = buildPrefixIndex(testData, 3);
    expect(index.get('l')).toHaveLength(3);
    expect(index.get('lh')).toHaveLength(1);
    expect(index.get('lhr')).toHaveLength(1);
  });

  it('should lookup by prefix', () => {
    const index = buildPrefixIndex(testData, 3);
    const results = lookupByPrefix(index, 'L', 3);
    expect(results).toHaveLength(3);
  });

  it('should return empty for too long query', () => {
    const index = buildPrefixIndex(testData, 3);
    const results = lookupByPrefix(index, 'LHRX', 3);
    expect(results).toHaveLength(0);
  });
});
```

### 2. Integration Tests

Update existing tests to handle new response format:

```typescript
expect(response.json()).toMatchObject({
  data: expect.any(Array),
  total: expect.any(Number),
  returned: expect.any(Number),
});
```

### 3. Performance Benchmark

```bash
# Start server
npm start

# In another terminal, run benchmarks
npx autocannon -c 10 -d 10 http://localhost:3000/airports?query=L
npx autocannon -c 10 -d 10 http://localhost:3000/airports?query=LHR
npx autocannon -c 10 -d 10 http://localhost:3000/airlines?query=BA
```

Compare with baseline:
- Before: ~2,200 req/sec (airports)
- After: ~10,000+ req/sec (expected)

---

## Deployment Checklist

- [ ] Run transformation script: `node scripts/transform-data.js`
- [ ] Build project: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Run benchmarks and verify improvement
- [ ] Check memory usage (`process.memoryUsage()`)
- [ ] Update API documentation with `limit` parameter
- [ ] Add `data/transformed/` to version control (or regenerate on deploy)
- [ ] Update CI/CD to run `transform-data.js` before build

---

## Monitoring

After deployment, monitor:

1. **Response times:** Should drop by 50-70%
2. **Throughput:** Should increase by 5-10x
3. **Memory usage:** Will increase by 20-30MB (acceptable trade-off)
4. **Error rates:** Should remain unchanged
5. **Cache hit rates:** Monitor HTTP cache headers

---

## Rollback Plan

If issues arise:

1. Revert to previous git commit
2. Or temporarily disable indexing:
   ```typescript
   // Fallback to old method
   const airports = AIRPORTS.filter(a => 
     a.iataCode.toLowerCase().startsWith(query.toLowerCase())
   );
   ```

---

## Next Steps (Optional)

After implementing these optimizations:

1. **Add caching layer** (LRU cache for hot queries)
2. **Implement HTTP/2** support
3. **Add field filtering** (`?fields=iataCode,name`)
4. **Consider full-text search** for searching by airport name
5. **Add rate limiting** for API protection
6. **Implement monitoring** (Prometheus metrics)

---

## Questions?

Review the detailed analysis in `PERFORMANCE_ANALYSIS.md` for more information.
