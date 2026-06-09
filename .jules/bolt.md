## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-16 - Eager cache warming and V8 loop optimizations
**Learning:** Lazily initializing prefix maps for large datasets (~10,000 entries) adds significant cold-start latency (~45ms) to the first API request. Warming up these caches at startup eliminates this delay. Additionally, switching from `for...in` to `Object.keys()` with a standard `for` loop and avoiding `Object.assign` in transformation hot-paths provided a ~41.5% increase in total throughput.
**Action:** Eagerly initialize data structures at startup and use V8-optimized iteration patterns for hot data transformation paths.
