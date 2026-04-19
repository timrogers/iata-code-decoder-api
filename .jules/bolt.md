## 2025-04-19 - Prefix-based Map lookups for IATA codes
**Learning:** Linear scans (O(N)) on static datasets (e.g., ~10,000 airports) are a major bottleneck for lookups. Implementing a prefix-based Map at startup allows for O(1) lookup complexity for both exact and partial matches.
**Action:** Always consider pre-computing lookup tables for static datasets during application initialization.

## 2025-04-19 - Fastify Logger Impact
**Learning:** Fastify's default logger significantly impacts throughput and latency benchmarks. Disabling it revealed the true performance gains of algorithmic optimizations.
**Action:** Temporarily disable logging during performance profiling and benchmarking to isolate algorithmic overhead.
