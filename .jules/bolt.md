## 2025-04-06 - Prefix-based Map for O(1) Lookups
**Learning:** Linear scans (O(N)) on static datasets (like ~9,000 airports) become a significant bottleneck as the dataset grows or request volume increases. Pre-calculating a Map of all possible prefixes at startup allows for O(1) lookup complexity, providing a massive performance boost (from ~0.43ms to ~0.0002ms per request in this case).
**Action:** Always prefer pre-calculated lookup tables (Maps or Sets) for static dataset searches instead of repeated array filtering.
