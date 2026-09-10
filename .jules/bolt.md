## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-23 - Eager cache warming and regex precision
**Learning:** Proactive cache warming via Fastify's `onReady` hook eliminates cold-start latency for search-heavy endpoints. Additionally, regex for string transformation must use non-capturing or correctly scoped groups to avoid preserving unwanted characters (like underscores in camelCase).
**Action:** Use `app.addHook('onReady', ...)` for expensive indexing tasks. Always verify utility transformations with a focused test script and ensure the project is rebuilt before performance verification.
