## 2025-04-01 - O(N) linear scan on static datasets
**Learning:** For static datasets like IATA codes (~10,000 entries), linear scans using `filter()` on every request introduce unnecessary O(N) complexity. Pre-calculating a prefix-based Map allows for O(1) lookup, providing a significant performance boost for search functionality.
**Action:** Always consider if a static dataset can be indexed into a Map or similar O(1) structure during application startup to avoid repetitive linear scans.
