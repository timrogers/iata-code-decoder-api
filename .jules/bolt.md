## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-06-22 - Eager cache warming and strict schemas
**Learning:** Cold-start latency for the first request can be significant (~88ms) due to lazy indexing of large datasets. Stricter Fastify schemas (with `required` and `additionalProperties: false`) require precise data preparation in loaders (mapping keys and handling nulls) but enable maximum `fast-json-stringify` performance.
**Action:** Use Fastify's `onReady` hook to eagerly warm caches during startup, and ensure data loaders exactly match strict response schemas to avoid serialization errors.
