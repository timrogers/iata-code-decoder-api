## 2025-03-31 - Prefix Map Optimization for IATA Lookups
**Learning:** Linear scans ($O(N)$) on static datasets like airports (~9,000 entries) are a significant bottleneck for search endpoints. Pre-calculating a Map of all possible prefixes allows for $O(1)$ lookups, yielding a massive performance boost.
**Action:** Always consider pre-processing static datasets into efficient lookup structures (Maps/Sets) at startup if the data is read-heavy and has predictable search patterns.

### Benchmarks (avg of 10000 iterations)
| Operation | Original ($O(N)$) | Optimized ($O(1)$) | Speedup |
|-----------|------------------|-------------------|---------|
| Airport lookup (LHR) | ~0.55ms | ~0.00025ms | ~2200x |
| Airline lookup (BA) | ~0.04ms | ~0.00015ms | ~260x |
| Aircraft lookup (777) | ~0.02ms | ~0.00012ms | ~160x |
