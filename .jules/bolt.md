## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-07-02 - Eager cache warming and loader overhead
**Learning:** Generic key transformation (like `cameliseKeys`) using regex and iteration over large datasets adds significant overhead during data ingestion. Explicit property mapping in loaders is much faster. Additionally, lazy initialization of caches causes high cold-start latency for the first request; using a Fastify `onReady` hook to warm caches shifts this cost to server startup.
**Action:** Use explicit property mapping for high-performance data loaders and use `onReady` hooks to warm caches for predictable first-request performance.
