## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-06-28 - Eager cache warming for "Cold Start" elimination
**Learning:** Even with O(1) lookups, the first request to a Node.js server can be slow due to lazy initialization of large datasets (e.g., ~10,000 entries). Using a Fastify `onReady` hook to warm caches shifts this cost to the startup phase, reducing the first request latency by ~95% (from ~40ms to ~2ms).
**Action:** Implement eager cache warming for static datasets to ensure consistent high performance from the very first request.
