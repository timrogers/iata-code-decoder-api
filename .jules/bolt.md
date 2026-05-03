## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-03 - Strict Fastify response schemas and serialization
**Learning:** Using `required` properties and `additionalProperties: false` in Fastify response schemas allows `fast-json-stringify` to generate highly optimized serialization code. However, it requires absolute alignment with the returned data; any missing required property or unexpected extra property (if not allowed) can lead to 500 errors or silent data omission.
**Action:** When optimizing schemas, ensure data transformation logic (like camelization) preserves or adds all required fields, including those needed for backward compatibility.
