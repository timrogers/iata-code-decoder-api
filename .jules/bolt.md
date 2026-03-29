# Bolt's Journal - Critical Learnings ⚡

## 2025-03-29 - [Initial Entry]
**Learning:** Initializing the journal for the IATA Code Decoder API optimization mission.
**Action:** Follow the daily process: PROFILE, SELECT, OPTIMIZE, VERIFY, and PRESENT.

## 2025-03-29 - [Optimized IATA Lookups with Prefix Maps]
**Learning:** Linear scans (O(N)) on the ~10,000 airport dataset was the main bottleneck. By pre-computing a Map of all possible IATA prefixes to their matching objects, search complexity was reduced to O(1).
**Action:** Performance improved from ~0.67ms/req to ~0.15ms/req (a ~4.5x speedup for typical queries).
