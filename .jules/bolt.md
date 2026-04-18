## 2026-04-18 - Prefix-based Map Optimization
**Learning:** Linear scans (O(N)) on static datasets like IATA codes (up to ~9,000 entries) are a significant bottleneck for high-throughput APIs. Pre-calculating a Map of all possible lowercase prefixes (O(1) lookup) provides a massive performance boost with minimal memory overhead, especially for short codes (2-3 chars).
**Action:** Always consider pre-calculating lookup tables or prefix maps for small, static datasets that are frequently queried.

## 2026-04-18 - Large Response Payload Bottleneck
**Learning:** While O(1) Map lookups improve processing time, API performance for broad queries (e.g., a single letter prefix returning ~500 airports) is heavily constrained by JSON serialization and network transmission (~52MB/s in this environment).
**Action:** For broad searches, consider pagination or field filtering to reduce the response payload size.
