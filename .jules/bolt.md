## 2025-04-22 - Prefix-based Map lookup for IATA codes
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a major bottleneck for lookup performance. Pre-calculating a prefix-based Map at startup allows for O(1) lookup complexity, significantly improving throughput.
**Action:** Always consider pre-processing static datasets into indexed lookups (Maps or Sets) for frequently searched fields like codes or IDs.

## 2025-04-23 - Optimized Key Camelization and JSON Serialization
**Learning:** In projects with large static datasets, standard JSON serialization and object key transformation (using intermediate arrays) can become significant bottlenecks. Providing detailed Fastify response schemas enables `fast-json-stringify`, which is much faster than `JSON.stringify`. Additionally, refactoring object transformations to avoid intermediate array allocations (e.g., using `for...in` instead of `Object.entries().map()`) and memoizing repetitive string operations (like key camelization) reduces GC pressure and CPU usage.
**Action:** Always provide detailed response schemas in Fastify for performance-critical routes. Use simple loops and memoization for data transformation logic involving large collections or repetitive operations.
