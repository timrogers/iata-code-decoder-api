## 2025-05-14 - Linear Scans on Static IATA Datasets
**Learning:** Linear scans (O(N)) on static datasets with ~10,000 entries (like airports) are a significant CPU bottleneck. Since IATA codes are very short (2-3 chars), a prefix-based Map provides O(1) lookup with minimal memory overhead.
**Action:** Always prefer Map-based indexing for fixed datasets indexed by short codes or IDs.

## 2025-05-14 - Fastify Logging Impact on Benchmarks
**Learning:** Fastify's default logger (pino) has a measurable impact on synthetic benchmarks, masking algorithmic gains.
**Action:** Disable logger (`logger: false`) when profiling pure algorithmic changes to get cleaner metrics.

## 2025-05-14 - Serialization Bottleneck for Large Payloads
**Learning:** Algorithmic optimization from O(N) to O(1) yields massive gains for small result sets (e.g. 11,000+ Req/sec for 1 result), but for large results (e.g. 400+ airports), throughput is limited by JSON serialization and network transmission, not lookup speed.
**Action:** Be mindful that total response time includes serialization; for truly large datasets, pagination or field filtering would be the next step.
