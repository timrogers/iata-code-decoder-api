## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-04-27 - Schema-driven serialization and property alignment
**Learning:** Adding 'required' properties and 'additionalProperties: false' to Fastify response schemas allows 'fast-json-stringify' to generate even more optimized serialization code. Additionally, property name mismatches between the data transformation (e.g., camelization) and the schema can lead to missing fields and serialization overhead.
**Action:** Always align TypeScript interfaces, data transformation logic, and Fastify schemas. Use strict schema definitions ('required' and 'additionalProperties: false') to maximize serialization throughput.
