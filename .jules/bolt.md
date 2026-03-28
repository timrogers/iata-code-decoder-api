## 2025-03-28 - [O(1) IATA Code Lookups with Prefix-Based Maps]
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a bottleneck when searching by IATA code prefixes. By pre-processing these datasets into prefix-based Maps at startup, lookups can be reduced from O(N) to O(1), providing a ~1000x speed improvement.
**Action:** Use prefix-based Map lookups for IATA code searches in this codebase instead of `.filter()`.
