## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-20 - Eager cache warming for cold-start reduction
**Learning:** Lazy initialization of large data structures (like prefix maps for ~10,000 entries) causes a significant latency spike (e.g., ~38ms) on the first request. Eagerly warming these caches at startup shifts this cost to the boot phase, ensuring consistent request performance from the start.
**Action:** Always invoke lazy getters for static dataset indices during module initialization to eliminate first-request "cold start" penalties.

## 2026-05-20 - Schema strictness for Fastify serialization
**Learning:** Fastify's `fast-json-stringify` performs best when schemas are highly specific (using `required` and `additionalProperties: false`). This allows it to generate specialized serialization code that outperforms generic `JSON.stringify`.
**Action:** Define comprehensive response schemas with all required fields and no additional properties for performance-critical endpoints.
