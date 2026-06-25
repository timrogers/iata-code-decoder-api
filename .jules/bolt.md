## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2026-05-12 - Multi-layered serialization and transformation optimization
**Learning:** Significant performance gains can be achieved by optimizing both data transformation (replacing `Object.assign` with direct mutation, using indexed loops over `for...in`) and serialization (adding `required` and `additionalProperties: false` to Fastify schemas). Cache warming at startup further reduces user-perceived latency by eliminating cold-start penalties.
**Action:** Review the entire data pipeline from raw source to final JSON output. Look for redundant allocations and ensure serialization hints are provided to the framework.
