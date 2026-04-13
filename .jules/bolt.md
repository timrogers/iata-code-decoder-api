## 2025-05-14 - O(1) Prefix Map vs Linear Filter
**Learning:** Linear scans (O(N)) using `filter` and `startsWith` on static datasets of ~10,000 items are a significant bottleneck in high-throughput APIs. Pre-calculating a Map of all possible prefixes at startup reduces search complexity to O(1). Fastify's default logger also adds significant overhead (~5ms per request in this environment).
**Action:** Always prefer Map-based or trie-based lookups for static search datasets. Temporarily disable logging during profiling to isolate algorithmic performance.
