## 2025-04-10 - Prefix-based Map for IATA Lookups
**Learning:** Linear scans (O(N)) on static IATA datasets (e.g., ~10,000 airports) are a significant bottleneck even with small payloads. Prefix-based Map lookups provide O(1) performance for both partial and exact matches.
**Action:** Always prefer pre-calculated Maps or Tries for fixed-set prefix matching tasks. Disabling Fastify logger during benchmarks helps isolate algorithmic gains from I/O overhead.
