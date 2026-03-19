## 2025-03-19 - [O(1) IATA Code Prefix Lookup]
**Learning:** For small, fixed-length datasets (like IATA codes), pre-calculating results for all possible prefixes in a Map provides a massive performance boost (~3-10x) over array filtering (O(N)) at a negligible memory cost.
**Action:** Always consider prefix-based Maps for search functionality involving small datasets with known key constraints.
