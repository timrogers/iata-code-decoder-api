## 2025-05-15 - Strict Fastify response schemas and data optionality
**Learning:** Fastify's `fast-json-stringify` provides a significant performance boost but requires exact alignment between the schema and the returned data. Missing properties or mismatched types (especially null values) in objects returned by loaders will cause 500 serialization errors when `required` is used in the schema.
**Action:** When tightening Fastify schemas with `required` and `additionalProperties: false`, ensure data loaders explicitly initialize all required fields (e.g., using `?? null`) if the source data might omit them.

## 2025-05-15 - Eager cache warming for prefix Maps
**Learning:** Initializing large prefix-based Maps (indexing ~10,000 entries) on the first request causes significant cold-start latency (e.g., ~114ms). Shifting this work to a Fastify `onReady` hook reduces the first-request latency to ~14ms.
**Action:** Use Fastify lifecycle hooks (`onReady`) to warm up expensive in-memory caches before the server begins accepting traffic.
