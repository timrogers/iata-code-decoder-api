import { AIRPORTS, AIRPORT_INDEX } from '../src/airports.js';
import { AIRLINES, AIRLINE_INDEX } from '../src/airlines.js';
import { AIRCRAFT, AIRCRAFT_INDEX } from '../src/aircraft.js';
import { Keyable } from '../src/types.js';

/**
 * This test directly benchmarks the lookup performance without HTTP overhead
 * to demonstrate the actual algorithmic improvement.
 */
describe('Direct Lookup Performance Benchmark', () => {
  // Old linear search implementation
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

  it('should show performance improvement for airport lookups', () => {
    const queries = ['L', 'LH', 'LHR', 'J', 'JF', 'JFK', 'A', 'AB', 'ABC'];
    const iterations = 1000;

    // Benchmark old linear search
    const oldStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      filterObjectsByPartialIataCode(AIRPORTS, query, 3);
    }
    const oldTime = performance.now() - oldStart;

    // Benchmark new indexed lookup
    const newStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      AIRPORT_INDEX.lookup(query);
    }
    const newTime = performance.now() - newStart;

    const improvement = ((oldTime - newTime) / oldTime) * 100;

    console.log(`\nAirport Lookup Benchmark (${iterations} iterations):`);
    console.log(`  Old linear search: ${oldTime.toFixed(2)}ms`);
    console.log(`  New indexed lookup: ${newTime.toFixed(2)}ms`);
    console.log(`  Improvement: ${improvement.toFixed(1)}% faster`);
    console.log(`  Speedup: ${(oldTime / newTime).toFixed(1)}x`);

    // New implementation should be significantly faster
    expect(newTime).toBeLessThan(oldTime);
  });

  it('should show performance improvement for airline lookups', () => {
    const queries = ['A', 'AA', 'B', 'BA', 'U', 'UA'];
    const iterations = 1000;

    // Benchmark old linear search
    const oldStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      filterObjectsByPartialIataCode(AIRLINES, query, 2);
    }
    const oldTime = performance.now() - oldStart;

    // Benchmark new indexed lookup
    const newStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      AIRLINE_INDEX.lookup(query);
    }
    const newTime = performance.now() - newStart;

    const improvement = ((oldTime - newTime) / oldTime) * 100;

    console.log(`\nAirline Lookup Benchmark (${iterations} iterations):`);
    console.log(`  Old linear search: ${oldTime.toFixed(2)}ms`);
    console.log(`  New indexed lookup: ${newTime.toFixed(2)}ms`);
    console.log(`  Improvement: ${improvement.toFixed(1)}% faster`);
    console.log(`  Speedup: ${(oldTime / newTime).toFixed(1)}x`);

    expect(newTime).toBeLessThan(oldTime);
  });

  it('should show performance improvement for aircraft lookups', () => {
    const queries = ['7', '77', '777', 'A', 'A3', 'A32'];
    const iterations = 1000;

    // Benchmark old linear search
    const oldStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
    }
    const oldTime = performance.now() - oldStart;

    // Benchmark new indexed lookup
    const newStart = performance.now();
    for (let i = 0; i < iterations; i++) {
      const query = queries[i % queries.length];
      AIRCRAFT_INDEX.lookup(query);
    }
    const newTime = performance.now() - newStart;

    const improvement = ((oldTime - newTime) / oldTime) * 100;

    console.log(`\nAircraft Lookup Benchmark (${iterations} iterations):`);
    console.log(`  Old linear search: ${oldTime.toFixed(2)}ms`);
    console.log(`  New indexed lookup: ${newTime.toFixed(2)}ms`);
    console.log(`  Improvement: ${improvement.toFixed(1)}% faster`);
    console.log(`  Speedup: ${(oldTime / newTime).toFixed(1)}x`);

    expect(newTime).toBeLessThan(oldTime);
  });

  it('should verify correctness of indexed lookups', () => {
    // Verify airports
    const airportTestCases = ['L', 'LH', 'LHR', 'JFK'];
    for (const query of airportTestCases) {
      const oldResult = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
      const newResult = AIRPORT_INDEX.lookup(query);
      expect(newResult).toEqual(oldResult);
    }

    // Verify airlines
    const airlineTestCases = ['A', 'AA', 'BA'];
    for (const query of airlineTestCases) {
      const oldResult = filterObjectsByPartialIataCode(AIRLINES, query, 2);
      const newResult = AIRLINE_INDEX.lookup(query);
      expect(newResult).toEqual(oldResult);
    }

    // Verify aircraft
    const aircraftTestCases = ['7', '77', '777', 'A32'];
    for (const query of aircraftTestCases) {
      const oldResult = filterObjectsByPartialIataCode(AIRCRAFT, query, 3);
      const newResult = AIRCRAFT_INDEX.lookup(query);
      expect(newResult).toEqual(oldResult);
    }
  });
});
