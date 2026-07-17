## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-07-08 - Explicit property mapping vs Generic transformation
**Learning:** Generic recursive transformation functions like `cameliseKeys` that use regex and iterate over all keys of every object in a large dataset (e.g., ~10,000 airports) introduce significant initialization overhead (~630ms vs ~66ms). Explicitly mapping properties for static datasets is an order of magnitude faster and improves type safety.
**Action:** Replace generic object transformation utilities with explicit mapping functions when dealing with large, static JSON datasets.
