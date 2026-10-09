## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-06-14 - Eager cache warming for static data indexing
**Learning:** For static datasets that require indexing (like IATA prefix maps), lazy initialization causes a significant latency spike (~35ms) for the very first request. Eagerly warming these caches using a Fastify `onReady` hook shifts this cost to the server startup phase, enabling sub-millisecond response times for all user requests.
**Action:** Use lifecycle hooks (like `onReady` or `onListen`) to eagerly initialize expensive-to-compute static caches.
