## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-06-21 - Eager cache warming and strict serialization schemas
**Learning:** Eagerly warming up caches during server startup (e.g., via Fastify's `onReady` hook) significantly reduces the latency of the first request by pre-calculating indexed data structures. Additionally, using strict schemas with `required` properties and `additionalProperties: false` further optimizes `fast-json-stringify`, but requires careful data normalization in loaders to ensure all fields are explicitly present (even if `null`).
**Action:** Use `onReady` hooks for cache warming and ensure data loaders perfectly align with strict response schemas to prevent serialization errors.
