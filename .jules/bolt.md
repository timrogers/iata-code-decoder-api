## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2026-04-26 - Fastify Response Schema for serialization optimization
**Learning:** Fastify can significantly optimize JSON serialization using `fast-json-stringify` if detailed response schemas are provided. This is particularly effective for large result sets where `JSON.stringify` becomes a bottleneck.
**Action:** Always provide detailed response schemas for high-traffic endpoints or those returning large data arrays.
