## 2025-04-09 - O(1) Prefix-based Lookups for IATA Codes

**Learning:** Linear scans (O(N)) using `Array.prototype.filter` and `String.prototype.startsWith` on static datasets (e.g., ~10,000 airports) became a measurable bottleneck as the dataset grew. Using a pre-computed prefix-based Map allows for O(1) lookups, significantly improving Req/Sec and reducing latency.

**Action:** For static datasets where queries are prefix-based (like search-as-you-type or IATA lookups), pre-process the data into a Map at startup. Ensure the empty string prefix is handled to preserve "return all" behavior if applicable.
