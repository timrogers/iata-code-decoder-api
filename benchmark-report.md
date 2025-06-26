## API Performance Benchmarks

*Benchmarks run on 2025-06-26 at 08:57:07 UTC*

### Test Configuration
- **Duration**: 10 seconds per endpoint
- **Concurrent Connections**: 10
- **Pipelining**: 1

### Results Summary

| Endpoint | Avg Requests/sec | Avg Latency (ms) | P95 Latency (ms) | Throughput (bytes/sec) |
|----------|------------------|------------------|------------------|------------------------|
| Health Check | 10853 | 0.28 | NaN | 3960925 |
| Airport Search - Popular Airport (LHR) | 2728 | 3.14 | NaN | 1652736 |
| Airport Search - Partial Match (L) | 992 | 9.54 | NaN | 111378432 |
| Airport Search - Two Letter Match (LA) | 2654 | 3.35 | NaN | 15944909 |
| Airline Search - Popular Airline (AA) | 8950 | 0.53 | NaN | 6221005 |
| Airline Search - Single Letter (U) | 7665 | 0.86 | NaN | 64187597 |
| Aircraft Search - Boeing 737 (737) | 9229 | 0.49 | NaN | 3497779 |
| Aircraft Search - Partial Match (A) | 8202 | 0.73 | NaN | 33105510 |
| Error Scenario - Missing Query | 10583 | 0.33 | NaN | 4179968 |

### Detailed Results

#### Health Check
*Basic health check endpoint*

- **Total Requests**: 119367
- **Requests per Second**: 10853 avg, 6985 min, 11472 max
- **Latency**: 0.28ms avg, NaNms p95, 2ms p99
- **Throughput**: 3960925 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Airport Search - Popular Airport (LHR)
*Search for Heathrow airport*

- **Total Requests**: 27273
- **Requests per Second**: 2728 avg, 2316 min, 2863 max
- **Latency**: 3.14ms avg, NaNms p95, 6ms p99
- **Throughput**: 1652736 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Airport Search - Partial Match (L)
*Search airports starting with L*

- **Total Requests**: 9923
- **Requests per Second**: 992 avg, 969 min, 1028 max
- **Latency**: 9.54ms avg, NaNms p95, 19ms p99
- **Throughput**: 111378432 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Airport Search - Two Letter Match (LA)
*Search airports starting with LA*

- **Total Requests**: 26535
- **Requests per Second**: 2654 avg, 2537 min, 2695 max
- **Latency**: 3.35ms avg, NaNms p95, 7ms p99
- **Throughput**: 15944909 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Airline Search - Popular Airline (AA)
*Search for American Airlines*

- **Total Requests**: 89499
- **Requests per Second**: 8950 avg, 7387 min, 9603 max
- **Latency**: 0.53ms avg, NaNms p95, 2ms p99
- **Throughput**: 6221005 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Airline Search - Single Letter (U)
*Search airlines starting with U*

- **Total Requests**: 76638
- **Requests per Second**: 7665 avg, 7160 min, 8084 max
- **Latency**: 0.86ms avg, NaNms p95, 3ms p99
- **Throughput**: 64187597 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Aircraft Search - Boeing 737 (737)
*Search for Boeing 737 aircraft*

- **Total Requests**: 92292
- **Requests per Second**: 9229 avg, 7946 min, 9811 max
- **Latency**: 0.49ms avg, NaNms p95, 2ms p99
- **Throughput**: 3497779 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Aircraft Search - Partial Match (A)
*Search aircraft starting with A*

- **Total Requests**: 82028
- **Requests per Second**: 8202 avg, 6927 min, 8669 max
- **Latency**: 0.73ms avg, NaNms p95, 3ms p99
- **Throughput**: 33105510 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

#### Error Scenario - Missing Query
*Test error handling for missing query parameter*

- **Total Requests**: 105812
- **Requests per Second**: 10583 avg, 9019 min, 11483 max
- **Latency**: 0.33ms avg, NaNms p95, 2ms p99
- **Throughput**: 4179968 bytes/sec avg
- **Errors**: 0
- **Timeouts**: 0

### Performance Notes

- All tests performed against a local instance running on Node.js v18
- The API uses in-memory data structures for fast lookups
- Response times include JSON serialization and HTTP overhead
- Cache headers are set to 1 day for data endpoints, no-cache for health endpoint
- Gzip compression is enabled

### Hardware/Environment
- **OS**: Linux (AWS environment)
- **Node.js**: v18.x
- **Memory**: In-memory JSON data loaded at startup
- **Database**: Static JSON files (no external database calls)
