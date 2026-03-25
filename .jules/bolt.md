## 2025-05-14 - O(1) Prefix-based IATA Search
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~9,000 airports) in Fastify route handlers are a major performance bottleneck for search operations. Replacing array filtering with a prefix-based Map (O(1) lookup) built at startup provides a massive (~1800x) speed improvement without requiring external databases or complex data structures.
**Action:** Always prefer pre-computing indexes for static datasets used in search operations, especially when the search space is small enough to fit in memory (like IATA codes).
