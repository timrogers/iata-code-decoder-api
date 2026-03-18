## 2025-03-18 - [IATA Code Search Optimization]
**Learning:** For small, fixed-length string lookups (like 2-3 character IATA codes), a pre-computed prefix map is significantly faster than array filtering ($O(1)$ vs $O(N)$). Memory overhead is minimal for datasets under 100,000 items.
**Action:** Always prefer Map-based lookups for frequently queried data with a known small set of search patterns.
