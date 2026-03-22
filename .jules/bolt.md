# BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-03-22 - [IATA Code Lookup Bottleneck]
**Learning:** The application was performing $O(N)$ linear scans over large datasets (nearly 10,000 airports) for every search query, including prefix matches. Replacing this with a pre-calculated prefix Map reduces the search time from seconds to milliseconds.
**Action:** Always prefer Map or Hash-based lookups for search functionality in this codebase, especially when the data is static and loaded at startup.
