## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-06-15 - Fastify eager cache warming and schema consistency
**Learning:** Initializing prefix maps lazily causes significant cold-start latency (~35ms). Using an `onReady` hook to warm these caches during startup reduces the first request time to <2ms. Additionally, when using strict Fastify schemas with `required` and `additionalProperties: false`, the schema must perfectly match the internal data model (e.g., using camelCase `timeZone` consistently) to avoid serialization overhead or runtime errors.
**Action:** Implement `onReady` hooks for warming expensive caches and ensure full consistency between data models and optimized Fastify schemas.
