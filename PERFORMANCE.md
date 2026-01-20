# Performance Optimization: IATA Code Lookups

## Overview

This document describes the performance optimization implemented for IATA code lookups in the API.

## Problem

The original implementation used a linear array filter (`Array.prototype.filter()`) for every lookup request:

```typescript
const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};
```

This resulted in **O(n)** time complexity for each lookup, scanning through:
- 9,026 airports (~0.22ms per lookup)
- 777 airlines (~0.02ms per lookup)
- 511 aircraft (~0.01ms per lookup)

## Solution

Implemented optimized lookup structures using Maps for **O(1)** access:

1. **Exact Match Map**: For full IATA code matches (e.g., "LHR", "BA", "777")
2. **Prefix Index Map**: For partial matches (e.g., "L", "LA", "A")

The indexes are built once at module load time (~9ms startup cost), eliminating the need for linear scans on every request.

### Implementation

Created `src/lookup.ts` with:
- `buildLookupIndex()`: Builds optimized Map-based indexes
- `createLookupFunction()`: Creates a specialized lookup function for each dataset
- `lookupByPartialIataCode()`: Performs O(1) lookups using the indexes

Updated `src/api.ts` to:
- Build indexes at startup: `lookupAirport`, `lookupAirline`, `lookupAircraft`
- Replace `filterObjectsByPartialIataCode()` calls with optimized lookups

## Performance Results

### Airport Lookups (9,026 items)

| Query | Old Avg | New Avg | Speedup | Improvement |
|-------|---------|---------|---------|-------------|
| LHR   | 255.84µs | 223.75ns | 1143x | 99.91% |
| JFK   | 249.23µs | 105.47ns | 2363x | 99.96% |
| L     | 233.17µs | 180.79ns | 1290x | 99.92% |
| LA    | 240.38µs | 132.10ns | 1820x | 99.95% |
| LON   | 251.46µs | 89.93ns  | 2796x | 99.96% |

### Airline Lookups (777 items)

| Query | Old Avg | New Avg | Speedup | Improvement |
|-------|---------|---------|---------|-------------|
| BA    | 17.53µs | 139.56ns | 126x  | 99.20% |
| AA    | 17.67µs | 155.07ns | 114x  | 99.12% |
| A     | 16.62µs | 114.09ns | 146x  | 99.31% |
| UA    | 18.51µs | 93.04ns  | 199x  | 99.50% |
| DL    | 17.60µs | 105.83ns | 166x  | 99.40% |

### Aircraft Lookups (511 items)

| Query | Old Avg | New Avg | Speedup | Improvement |
|-------|---------|---------|---------|-------------|
| 777   | 12.96µs | 94.93ns | 137x  | 99.27% |
| 7     | 12.09µs | 80.93ns | 149x  | 99.33% |
| A3    | 12.53µs | 122.02ns | 103x | 99.03% |
| B7    | 12.52µs | 96.05ns  | 130x | 99.23% |

## Summary

- **Average speedup**: 100x - 2800x faster depending on dataset size
- **Time reduction**: 99%+ improvement across all lookups
- **Startup cost**: ~9ms one-time index build time
- **Memory overhead**: Maps for storing pre-computed indexes (negligible)
- **API compatibility**: Zero changes to API response format or behavior

## Running the Benchmark

```bash
npm run build
npx tsx benchmark.ts
```

## Testing

All existing tests pass without modification:

```bash
npm test
```

The optimization maintains:
- ✅ Exact IATA code matches
- ✅ Partial prefix matches
- ✅ Case-insensitive matching
- ✅ Empty array for queries longer than max code length
- ✅ All API response formats
