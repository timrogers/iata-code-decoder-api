## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-07-06 - Explicit mapping vs generic cameliseKeys
**Learning:** Generic object transformation utilities like `cameliseKeys` that use regex and dynamic property iteration are significantly slower (~90% slower in this codebase) than explicit property mapping for large datasets. Additionally, lazy initialization of caches causes a noticeable latency spike on the first request ("cold-start").
**Action:** Use explicit property mapping for static data loaders and implement eager cache warming via Fastify's `onReady` hook to ensure consistent response times from the first request.
