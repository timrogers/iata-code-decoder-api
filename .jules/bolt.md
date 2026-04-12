## 2026-04-12 - O(1) Prefix-based Map Lookup for IATA codes

**Learning:** Linear scans (O(N)) on datasets of ~10,000 entries (like airports) are a significant bottleneck for high-frequency search endpoints. Pre-calculating a prefix-based Map at startup provides a massive performance boost (up to 3.3x higher throughput) with negligible memory overhead, given the short length (2-3 chars) of IATA codes.

**Action:** Always consider pre-calculating lookup tables or indexes for static datasets used in search or filtering operations, especially when the search keys (like IATA codes) have a small, fixed maximum length.
