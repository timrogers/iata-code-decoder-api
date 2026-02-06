# Performance Optimization Quick Reference

## 🎯 Top 5 Recommendations (By Impact)

### 1. Prefix-Based Indexing for Airports ⭐⭐⭐⭐⭐
**Impact**: 30-100x faster lookups (300μs → 3-10μs)  
**Effort**: Medium (2-3 hours)  
**Priority**: Critical

Create a trie-like index for O(1) IATA code lookups instead of O(n) linear search.

### 2. Pre-Compute Camelized Data ⭐⭐⭐⭐⭐
**Impact**: 70ms faster startup (77% reduction)  
**Effort**: Low (1-2 hours)  
**Priority**: Critical

Store JSON with camelCase keys, eliminate runtime transformation.

### 3. LRU Response Caching ⭐⭐⭐⭐
**Impact**: 99.9% faster for cached queries (<1μs)  
**Effort**: Low (1-2 hours)  
**Priority**: High

Cache query results with LRU eviction. Expected 60-80% hit rate.

### 4. Pagination Support ⭐⭐⭐⭐
**Impact**: 90% smaller responses (200KB → 20KB)  
**Effort**: Medium (2-3 hours)  
**Priority**: High

Limit default results to 100, add pagination params.

### 5. Fast JSON Serialization ⭐⭐⭐
**Impact**: 20-30% faster serialization  
**Effort**: Low (1 hour)  
**Priority**: Medium

Use `fast-json-stringify` with pre-compiled schemas.

---

## 📊 Current Performance Baseline

```
Data Loading:
├─ airports.json: 87.42ms (70ms transformation)
├─ airlines.json: 11.23ms (4.7ms transformation)
└─ aircraft.json: 1.40ms (0.9ms transformation)

Query Performance:
├─ Airports (9,027 records): ~300μs average
├─ Airlines (777 records):   ~16-20μs average
└─ Aircraft (511 records):   ~12μs average

Memory Usage: 17.6MB for all data
```

---

## 🚀 Quick Start Implementation

### Step 1: Pre-Compute Camelized Data (70ms savings)

Update data generation scripts:

```javascript
// scripts/generate_airports_json.js
const camelCase = (str) => 
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const transformKeys = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(transformKeys);
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      camelCase(key),
      transformKeys(value)
    ])
  );
};

// After fetching from Duffel
const camelizedData = data.map(transformKeys);
fs.writeFileSync('./data/airports.json', JSON.stringify(camelizedData, null, 2));
```

Simplify data loading:

```typescript
// src/airports.ts - Remove transformation
export const AIRPORTS: Airport[] = AIRPORTS_DATA as Airport[];
```

### Step 2: Add LRU Caching (99% faster)

```bash
npm install lru-cache
```

```typescript
// src/cache.ts
import { LRUCache } from 'lru-cache';

export const AIRPORTS_CACHE = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60, // 1 hour
});

// src/api.ts
const cacheKey = `airports:${query}`;
let airports = AIRPORTS_CACHE.get(cacheKey);

if (!airports) {
  airports = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
  AIRPORTS_CACHE.set(cacheKey, airports);
}
```

### Step 3: Implement Prefix Indexing (30-100x faster)

```typescript
// src/airports.ts
type PrefixIndex = { [key: string]: Airport[] };

const createPrefixIndex = (airports: Airport[]): PrefixIndex => {
  const index: PrefixIndex = {};
  
  for (const airport of airports) {
    const code = airport.iataCode.toLowerCase();
    
    // Index 1-char, 2-char, and 3-char prefixes
    for (let i = 1; i <= Math.min(code.length, 3); i++) {
      const prefix = code.substring(0, i);
      if (!index[prefix]) index[prefix] = [];
      index[prefix].push(airport);
    }
  }
  
  return index;
};

export const AIRPORTS_PREFIX_INDEX = createPrefixIndex(AIRPORTS);

export const findAirportsByPrefix = (query: string): Airport[] => {
  if (!query || query.length === 0 || query.length > 3) return [];
  return AIRPORTS_PREFIX_INDEX[query.toLowerCase()] || [];
};
```

---

## 🧪 Testing Performance

### Run Analysis Script

```bash
node scripts/analyze_performance.js
```

### Benchmark with Autocannon

```bash
# Install globally
npm install -g autocannon

# Start server
npm run dev

# Benchmark airports endpoint
autocannon -c 100 -d 30 http://localhost:4000/airports?query=LHR

# Expected results:
# Before: ~3000 req/s, 30ms latency
# After:  ~10000 req/s, 10ms latency
```

---

## 📈 Expected Improvements

| Optimization | Metric | Before | After | Improvement |
|--------------|--------|--------|-------|-------------|
| Pre-compute | Startup | 102ms | 30ms | 70% faster |
| Prefix Index | Airport Query | 300μs | 3-10μs | 30-100x faster |
| LRU Cache | Cached Query | 300μs | <1μs | 99.9% faster |
| Pagination | Response Size | 200KB | 20KB | 90% smaller |
| Fast JSON | Serialization | 100μs | 70μs | 30% faster |

**Combined Impact**:
- Startup: 70% faster
- Throughput: 3-5x more requests/second
- Latency: 95% reduction for typical queries
- Memory: +3-5MB (acceptable trade-off)

---

## 📝 Implementation Checklist

### Phase 1: Quick Wins (Week 1)
- [ ] Pre-compute camelized data in generation scripts
- [ ] Regenerate all JSON files
- [ ] Remove runtime camelization
- [ ] Add LRU cache for queries
- [ ] Optimize compression settings
- [ ] Add query validation and normalization

### Phase 2: Core Performance (Week 2)
- [ ] Implement prefix-based indexing
- [ ] Add pagination support
- [ ] Use fast-json-stringify
- [ ] Update airlines endpoint behavior
- [ ] Add cache statistics

### Phase 3: Monitoring (Week 3)
- [ ] Add performance metrics
- [ ] Implement health check with stats
- [ ] Set up benchmarking suite
- [ ] Add request coalescing (optional)

---

## 🔍 Monitoring Metrics

After implementation, track:

```typescript
// Key metrics to monitor
{
  startup_time: "30ms",        // Target: <50ms
  avg_query_time: "10μs",      // Target: <20μs
  cache_hit_rate: "75%",       // Target: >60%
  memory_usage: "22MB",        // Target: <50MB
  requests_per_second: "8000", // Target: >5000
  p95_latency: "15ms",         // Target: <20ms
  error_rate: "0%"             // Target: 0%
}
```

---

## 💡 Additional Tips

1. **Use compression**: Already enabled via `@fastify/compress`
2. **Enable caching headers**: Already set to 1-day max-age
3. **Validate input early**: Prevent unnecessary processing
4. **Consider CDN**: For static-ish data endpoints
5. **Monitor in production**: Use APM tools (New Relic, DataDog)

---

## 🐛 Common Pitfalls

1. **Don't over-cache**: Use TTL and size limits
2. **Don't skip validation**: Always validate and normalize input
3. **Don't forget monitoring**: Measure impact of changes
4. **Don't optimize prematurely**: Focus on bottlenecks first
5. **Don't sacrifice clarity**: Keep code readable

---

## 📚 Resources

- [Fastify Performance Best Practices](https://www.fastify.io/docs/latest/Reference/Performance/)
- [Node.js Performance Optimization](https://nodejs.org/en/docs/guides/simple-profiling/)
- [LRU Cache Documentation](https://github.com/isaacs/node-lru-cache)
- [Fast JSON Stringify](https://github.com/fastify/fast-json-stringify)

---

## 🎓 Key Takeaways

1. **Indexing is critical** for large datasets (9K+ records)
2. **Pre-computation** beats runtime transformation
3. **Caching** provides massive wins for repeated queries
4. **Pagination** keeps responses small and fast
5. **Measure everything** before and after optimization

**Bottom Line**: These optimizations can improve throughput by 3-5x and reduce latency by 95% with minimal code complexity increase.
