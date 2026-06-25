## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-09 - Schema optimization and Cache Warming
**Learning:** Fastify's `fast-json-stringify` optimization (via `required` and `additionalProperties: false`) is highly sensitive to type mismatches. Specifically, properties like `icaoCode` that can be null in the dataset must be explicitly typed as `['string', 'null']` in the schema to avoid 500 errors during serialization.
**Action:** Always verify dataset nullability when tightening schemas. Combine schema optimizations with eager cache warming at startup to eliminate cold-start latency for IATA prefix maps.
