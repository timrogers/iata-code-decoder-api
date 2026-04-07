## 2025-04-07 - Optimize IATA code search with prefix-based Map lookup
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a bottleneck; prefix-based Map lookups (O(1)) provide significant performance improvements.
**Action:** Use a pre-calculated prefix Map for partial and exact code lookups on static datasets at startup.

## 2025-04-07 - Benchmarking with large payloads
**Learning:** For queries that return a large subset of the data (e.g., query='L' returning ~500 airports), the performance is heavily bottlenecked by JSON serialization and network transmission (~41MB/s), even after optimizing the lookup algorithm to O(1).
**Action:** Be mindful that algorithmic optimizations have diminishing returns for endpoints that return very large payloads; consider pagination or more restrictive searching if further speed is needed.
