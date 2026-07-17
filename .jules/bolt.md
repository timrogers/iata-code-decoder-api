## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-07-01 - Eager cache warming for startup performance
**Learning:** Lazy initialization of large data structures (like prefix maps for 10,000+ entries) causes significant "cold start" latency for the first user request. Using Fastify's `onReady` hook to eagerly initialize these structures shifts the performance cost from the user request to the server startup phase.
**Action:** Use `onReady` or similar lifecycle hooks to warm caches for heavy datasets during server startup, ensuring a fast experience for the very first user.
