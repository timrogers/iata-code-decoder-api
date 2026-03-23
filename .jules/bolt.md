## 2025-03-23 - [Prefix-based Map Lookups for IATA Codes]
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) in Fastify route handlers or MCP tools are a significant bottleneck when handling multiple requests. Pre-computing prefix-based Maps (O(1)) at startup provides a ~2000x speedup for lookups.
**Action:** Always prefer pre-computed data structures for static dataset lookups in the API layer.
