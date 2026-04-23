## 2025-04-21 - O(1) Prefix Map for IATA Code Lookup
**Learning:** Replacing O(N) linear scans with O(1) prefix-based Map lookups provides a massive boost (~7.3x throughput) for specific IATA code lookups. However, for broad partial matches (e.g., a single letter), the performance gain is limited (~18%) as the bottleneck shifts to JSON serialization and payload size.
**Action:** Use prefix maps for all small, static dataset lookups by key or prefix.
