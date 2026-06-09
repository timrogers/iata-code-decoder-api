## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-20 - Cold-start latency from lazy-loaded caches
**Learning:** Lazy-loading heavy data structures (like prefix maps for ~10k entries) causes a significant latency penalty (~35ms) on the very first request. This "cold-start" impact can be eliminated by "warming up" the caches during module initialization.
**Action:** For static datasets that require indexing, invoke the indexing logic at startup rather than on-demand to ensure consistent performance for all requests, including the first one.
