## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-20 - Balancing camelization with API compatibility
**Learning:** Automatically camelizing keys (e.g., `time_zone` to `timeZone`) can silently break API contracts if the response schema or clients expect snake_case. Furthermore, strict Fastify schemas with `required` properties will cause 500 errors if these transformed keys are missing.
**Action:** When using generic data transformers like `cameliseKeys`, explicitly restore or alias keys required by the public API to avoid breaking changes and serialization failures.
