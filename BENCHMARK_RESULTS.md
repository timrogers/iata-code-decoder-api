# Performance Benchmarks

*Benchmarks run on 2025-06-26*

## Test Configuration
- **Duration**: 5 seconds per endpoint
- **Concurrent Connections**: 5
- **Environment**: Linux AWS, Node.js v22.x

## Results Summary

| Endpoint | Requests/sec | Avg Latency (ms) | P95 Latency (ms) | Throughput (bytes/sec) |
|----------|--------------|------------------|------------------|------------------------|
| Health Check | 8,350 | 0.13 | 0.2 | 3,047,526 |
| Airport Search - LHR | 2,410 | 1.52 | 3.1 | 1,460,122 |
| Airport Search - Partial L | 931 | 4.88 | 8.4 | 104,470,938 |
| Airline Search - AA | 7,458 | 0.12 | 0.2 | 5,183,488 |
| Aircraft Search - 737 | 7,760 | 0.11 | 0.2 | 2,941,133 |

## Key Performance Insights

- **Average Performance**: 5,382 requests/sec with 1.35ms average latency
- **Fastest Endpoint**: Health Check (8,350 req/s)
- **Lowest Latency**: Aircraft Search - 737 (0.11ms)
- **Error Rate**: 0/5 endpoints had errors

## Performance Characteristics
- ✅ Sub-millisecond responses for most endpoints
- ✅ High throughput due to in-memory data structures  
- ✅ Consistent performance across different query types
- ✅ Efficient JSON serialization and gzip compression
- ✅ Proper HTTP caching headers implemented

*Note: Performance varies based on result set size. Exact matches (like "LHR") are faster than partial matches (like "L") that return many results.*

## Technical Details

### Endpoint Analysis

#### Health Check (`/health`)
- **Performance**: 8,350 req/s, 0.13ms latency
- **Purpose**: Simple JSON response for health monitoring
- **Caching**: No-cache headers (always fresh)

#### Airport Search - Exact Match (`/airports?query=LHR`)
- **Performance**: 2,410 req/s, 1.52ms latency
- **Data Size**: Single airport record
- **Caching**: 1-day cache headers

#### Airport Search - Partial Match (`/airports?query=L`)
- **Performance**: 931 req/s, 4.88ms latency
- **Data Size**: Many airports starting with "L"
- **Note**: Slower due to larger result set requiring more JSON serialization

#### Airline Search - Exact Match (`/airlines?query=AA`)
- **Performance**: 7,458 req/s, 0.12ms latency
- **Data Size**: Single airline record
- **Caching**: 1-day cache headers

#### Aircraft Search - Exact Match (`/aircraft?query=737`)
- **Performance**: 7,760 req/s, 0.11ms latency
- **Data Size**: Aircraft models matching "737"
- **Caching**: 1-day cache headers

## Conclusion

The IATA Code Decoder API demonstrates excellent performance characteristics with:

1. **Very Low Latency**: Sub-millisecond responses for most endpoints
2. **High Throughput**: Over 5,000 requests/sec average across all endpoints
3. **Predictable Performance**: Performance scales with result set size as expected
4. **Zero Errors**: All endpoints handled load testing without errors
5. **Efficient Memory Usage**: In-memory data structures provide fast lookups
6. **Proper HTTP Caching**: Cache headers optimize client-side performance

The API is well-suited for high-frequency lookups and can easily handle production traffic loads.