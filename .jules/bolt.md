## 2025-03-17 - [Prefix-based Map Indexing]
**Learning:** For datasets of ~10,000 entries (like airports), repeated `Array.prototype.filter()` with `startsWith()` creates a measurable bottleneck (\~4.7s for 10k lookups). Pre-calculating a Map of all possible prefixes (\~1-3 chars) reduces this to \~2ms, providing a \~2500x speedup with minimal memory overhead.
**Action:** Always prefer Map-based indexing for static datasets with defined search criteria (like IATA codes) instead of linear scans in hot paths.
