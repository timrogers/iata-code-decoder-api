## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-16 - Avoiding breaking changes during performance optimization
**Learning:** Renaming properties in an API to match camelCase conventions (e.g., `time_zone` to `timeZone`) is a breaking change and must be avoided in maintenance tasks. However, adding the new property while keeping the old one allows for both modernization and backward compatibility.
**Action:** When optimizing data transformation or serialization, ensure that the final JSON output remains backward compatible unless a breaking change is explicitly requested.

## 2025-05-16 - Schema precision for fast-json-stringify
**Learning:** `fast-json-stringify` requires exact matching between the data types and the schema. If a property can be `null` in the data (like `icaoCode`), it must be explicitly defined as `type: ['string', 'null']` in the schema, even if it is marked as `required`.
**Action:** Always verify the nullability of data fields when defining Fastify response schemas to prevent serialization errors.
