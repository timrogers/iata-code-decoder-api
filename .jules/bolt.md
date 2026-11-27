## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-06-20 - Eager cache warming via Fastify hooks
**Learning:** Lazy initialization of indices (e.g., prefix Maps) causes a "cold start" latency spike on the first request. Using Fastify's `onReady` hook to eagerly build these indices during server startup shifts this cost away from the user, significantly improving first-request response time.
**Action:** Implement `onReady` hooks for eager initialization of static dataset indices to eliminate cold-start latency for first-time callers.
