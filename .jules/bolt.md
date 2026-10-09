## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-22 - Optimizing Object Iteration and Transformation
**Learning:** In hot paths like data transformation (camelization), `for...in` and `Object.assign` introduce measurable overhead. Replacing `for...in` with `Object.keys()` + a standard `for` loop, and using direct mutation for temporary objects instead of `Object.assign`, significantly improves throughput (up to ~14% in this case) and reduces allocation pressure.
**Action:** Use indexed `for` loops over `Object.keys()` for hot iteration and prioritize direct mutation for single-use internal objects.
