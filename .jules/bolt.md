## 2025-04-03 - Prefix Map Optimization for IATA Lookups
**Learning:** For static datasets with limited-length keys (like IATA codes), a prefix-based Map can reduce lookup complexity from O(N) linear scans to O(1) constant-time access with minimal memory overhead.
**Action:** Always check if queryable datasets can be pre-processed into hash maps for faster runtime performance.
