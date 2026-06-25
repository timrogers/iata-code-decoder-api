## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-05-15 - Optimized JSON serialization with Fastify schemas
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost for large JSON payloads, but it requires detailed response schemas. Without schemas, Fastify falls back to generic `JSON.stringify`, which is much slower for serializing large arrays of objects.
**Action:** Always define explicit response schemas for data-heavy endpoints in Fastify to leverage high-performance serialization.

## 2025-05-26 - Eager Cache Warming and Regex Optimization
**Learning:** Lazy initialization of large data structures (like prefix maps for ~10,000 entries) causes a significant cold-start penalty on the first request (~35ms). Moving this to an `onReady` hook ensures the server is fully "warmed up" before accepting traffic, reducing the first request latency to ~12.5ms (~64% reduction). Additionally, optimizing core utility functions like `snakeCaseToCamelCase` by avoiding redundant string operations provides incremental wins across all data transformation paths.
**Action:** Use Fastify `onReady` hooks for expensive data pre-calculations and ensure core utilities use efficient regex/string methods.
