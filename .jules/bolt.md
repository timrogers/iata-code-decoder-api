## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-05 - Cold-start latency reduction via cache warm-up
**Learning:** Lazy-loading large datasets (like IATA code prefix maps) causes high latency (~142ms) for the first user request. Triggering these loaders during server initialization eliminates this "cold start" penalty.
**Action:** Always warm up static caches and data loaders at the end of the entry point file to ensure the application is request-ready as soon as it starts listening.
