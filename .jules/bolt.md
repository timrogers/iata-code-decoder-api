## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-20 - Eager cache warming and scope management
**Learning:** Shifting expensive initialization (like pre-indexing static datasets) from the first request to the module load phase effectively eliminates cold-start latency. Additionally, code reviews for performance tasks favor single, focused improvements over multiple micro-optimizations to maintain clarity and avoid introducing breaking changes (like strict schema validation stripping unexpected fields).
**Action:** Prioritize one clear, safe performance win per PR and avoid including unnecessary artifacts like lockfiles or build outputs.
