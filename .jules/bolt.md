## 2026-03-26 - [Prefix-based Map Optimization for IATA Lookups]
**Learning:** For static datasets of medium size (e.g., ~10,000 items), replacing linear `Array.filter` with pre-calculated prefix Maps provides a massive performance boost (~1700x) for partial string matching.
**Action:** Always consider pre-indexing static data at startup when lookup patterns are predictable (like prefix matching).
