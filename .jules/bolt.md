# Bolt's Performance Journal

## 2025-03-30 - Prefix-based Map for IATA search
**Learning:** Linear scans ($O(N)$) using `filter` on datasets of ~10,000 items (like the airports list) are a bottleneck for high-frequency search endpoints. Given that IATA codes have a very small, fixed set of possible prefixes (max 3 characters), a prefix-based Map provides a massive speedup with minimal memory overhead.
**Action:** Always consider pre-indexing small-to-medium static datasets at startup if they are frequently queried by prefix or exact match.

## 2025-03-30 - Case-sensitivity in Map keys
**Learning:** `Map` keys are case-sensitive. To maintain functional parity with case-insensitive `startsWith` filtering, both the index keys and the incoming query must be normalized (e.g., to lowercase).
**Action:** Standardize on lowercase for Map keys when building search indexes for user-provided queries.
