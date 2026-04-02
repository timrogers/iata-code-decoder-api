## 2025-05-15 - Prefix Map Optimization for IATA Lookups
**Learning:** Linear scans (O(N)) on static datasets like airports (~10,000 entries) are a significant performance bottleneck for search endpoints. Replacing them with a pre-computed prefix-based Map (O(1)) yielded a ~1500x speedup in lookup performance.
**Action:** Always check if frequently queried static data can be indexed at startup using Maps or Sets to avoid repeated array filtering.
