## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-20 - Schema Hardening for Serialization Performance
**Learning:** Fastify's `fast-json-stringify` achieves peak performance when schemas are strict (`additionalProperties: false` and explicit `required` lists). However, any mismatch between TypeScript types (e.g., nullable fields) and JSON schemas can cause serialization errors or invalid output.
**Action:** Always cross-reference TypeScript interfaces with Fastify response schemas when hardening for performance.

## 2025-05-20 - Avoiding Redundant Allocations in Data Mapping
**Learning:** For large datasets (e.g., ~10,000 items), using `Object.assign({}, ...)` or spread operators inside a `.map()` loop creates significant GC pressure. Direct mutation of a newly created object (like one returned from a transformation utility) is much more efficient.
**Action:** Mutate intermediate objects in transformation pipelines instead of creating shallow copies when performance is critical.
