## 2025-04-16 - O(1) prefix-based Map lookup for IATA codes

**Learning:** Linear scans (O(N)) using `array.filter` and `startsWith` on static datasets of ~10,000 items (like airports) are a significant bottleneck for search endpoints. Pre-calculating a prefix-based Map at startup allows for O(1) lookups, providing a massive throughput boost.

**Action:** Always consider pre-processing static or semi-static search datasets into hash maps or specialized trie structures when the search pattern (like prefix matching) is known in advance.

## 2025-04-16 - Fastify Logger Impact on Benchmarks

**Learning:** Fastify's default `pino` logger is very fast but still adds significant overhead in high-throughput benchmarks. When measuring purely algorithmic improvements, disabling the logger (`logger: false`) can reveal a ~2x-3x higher performance ceiling.

**Action:** Temporarily disable logging during profiling to isolate algorithmic bottlenecks from I/O bottlenecks.
