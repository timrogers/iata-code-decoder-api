## 2025-04-08 - Prefix-based Map for IATA Lookups
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a bottleneck even for small datasets when high throughput is required. Pre-calculating a Map of all possible prefixes (length 1 to N) enables O(1) lookup, significantly reducing latency and increasing Req/Sec.
**Action:** Use prefix-based Maps for any static dataset where partial string matching from the start is a primary search pattern.
