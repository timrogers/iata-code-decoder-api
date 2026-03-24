## 2025-03-24 - [Prefix-based Map Lookups for IATA Codes]
**Learning:** Linear scans (O(N)) on static datasets (like ~9,000 airports) during request handling are a significant bottleneck for read-heavy APIs. Pre-processing these datasets into prefix-based Maps at startup reduces lookup complexity to O(1), providing a massive performance boost (from ~4.7s to ~2.3ms for 10,000 in-process queries).
**Action:** Always consider pre-computing lookup tables for static or slowly-changing datasets, especially when the query pattern (like prefix matching) is well-defined.
