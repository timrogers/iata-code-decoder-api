## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-06-30 - Eager cache warming and data loader optimization
**Learning:** Cold-start latency for the first request can be significantly reduced (~70%) by shifting the O(N) indexing cost of static datasets from the request handler to a Fastify `onReady` hook. Additionally, replacing generic `cameliseKeys` with explicit property mapping in data loaders avoids massive regex overhead during startup.
**Action:** Use Fastify `onReady` hooks to warm caches for static datasets and prioritize explicit property mapping over generic transformation utilities for large data loads.
