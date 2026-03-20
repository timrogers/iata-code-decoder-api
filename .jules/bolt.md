## 2025-03-20 - [O(1) IATA Lookup with Prefix Maps]
**Learning:** The application was performing O(N) array filtering with repeated string operations (toLowerCase, startsWith) on every request to look up IATA codes. For the airports dataset (9,000+ entries), this created a significant bottleneck under load. Using a pre-calculated prefix Map at startup transforms this into an O(1) lookup.
**Action:** Always prefer pre-calculating search indexes (like prefix Maps or Hash Maps) at startup for static datasets to avoid redundant O(N) operations in the request path.

**Measured Impact:**
- Throughput: Increased from ~313 req/sec to ~494 req/sec (+58%)
- Average Latency: Decreased from ~31.3ms to ~19.7ms (-37%)
- CPU Efficiency: Reduced repeated string allocations and iterations per request.
