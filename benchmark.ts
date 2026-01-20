/**
 * Performance Benchmark: Linear Filter vs Optimized Lookup
 * 
 * This benchmark compares the old linear filter approach with the new
 * optimized lookup using Maps and prefix indexing.
 */

import { AIRPORTS } from './src/airports.js';
import { AIRLINES } from './src/airlines.js';
import { AIRCRAFT } from './src/aircraft.js';
import { createLookupFunction } from './src/lookup.js';
import { Keyable } from './src/types.js';

// Old implementation for comparison
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

// Helper to format time in microseconds
const formatTime = (ms: number): string => {
  const us = ms * 1000;
  if (us < 1) {
    return `${(us * 1000).toFixed(2)}ns`;
  } else if (us < 1000) {
    return `${us.toFixed(2)}µs`;
  } else {
    return `${(us / 1000).toFixed(2)}ms`;
  }
};

// Helper to run benchmark
interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

const benchmark = (
  name: string,
  fn: () => void,
  iterations: number = 10000,
): BenchmarkResult => {
  const times: number[] = [];
  
  // Warmup
  for (let i = 0; i < 100; i++) {
    fn();
  }

  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((a, b) => a + b, 0);
  const avgTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  return {
    name,
    iterations,
    totalTime,
    avgTime,
    minTime,
    maxTime,
  };
};

// Print results
const printResult = (result: BenchmarkResult) => {
  console.log(`\n${result.name}:`);
  console.log(`  Iterations: ${result.iterations}`);
  console.log(`  Total time: ${formatTime(result.totalTime)}`);
  console.log(`  Average:    ${formatTime(result.avgTime)}`);
  console.log(`  Min:        ${formatTime(result.minTime)}`);
  console.log(`  Max:        ${formatTime(result.maxTime)}`);
};

// Compare two results
const compareResults = (old: BenchmarkResult, optimized: BenchmarkResult) => {
  const speedup = old.avgTime / optimized.avgTime;
  const improvement = ((old.avgTime - optimized.avgTime) / old.avgTime) * 100;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Performance Comparison:`);
  console.log(`  Old average:       ${formatTime(old.avgTime)}`);
  console.log(`  Optimized average: ${formatTime(optimized.avgTime)}`);
  console.log(`  Speedup:           ${speedup.toFixed(2)}x faster`);
  console.log(`  Improvement:       ${improvement.toFixed(2)}% reduction in time`);
  console.log(`${'='.repeat(60)}`);
};

console.log('\n');
console.log('='.repeat(60));
console.log('IATA Code Lookup Performance Benchmark');
console.log('='.repeat(60));

// Test queries
const airportQueries = ['LHR', 'JFK', 'L', 'LA', 'LON'];
const airlineQueries = ['BA', 'AA', 'A', 'UA', 'DL'];
const aircraftQueries = ['777', 'A320', '7', 'A3', 'B7'];

// Build optimized indexes (this happens once at module load)
console.log('\nBuilding optimized lookup indexes...');
const indexStart = performance.now();
const lookupAirport = createLookupFunction(AIRPORTS, 3);
const lookupAirline = createLookupFunction(AIRLINES, 2);
const lookupAircraft = createLookupFunction(AIRCRAFT, 3);
const indexTime = performance.now() - indexStart;
console.log(`Index build time: ${formatTime(indexTime)}`);

console.log('\n');
console.log('='.repeat(60));
console.log('AIRPORT LOOKUPS (9,026 items)');
console.log('='.repeat(60));

for (const query of airportQueries) {
  console.log(`\nQuery: "${query}"`);
  
  const oldResult = benchmark(
    'Linear Filter (Old)',
    () => filterObjectsByPartialIataCode(AIRPORTS, query, 3),
    10000,
  );
  
  const newResult = benchmark(
    'Map Lookup (Optimized)',
    () => lookupAirport(query),
    10000,
  );
  
  printResult(oldResult);
  printResult(newResult);
  compareResults(oldResult, newResult);
}

console.log('\n');
console.log('='.repeat(60));
console.log('AIRLINE LOOKUPS (777 items)');
console.log('='.repeat(60));

for (const query of airlineQueries) {
  console.log(`\nQuery: "${query}"`);
  
  const oldResult = benchmark(
    'Linear Filter (Old)',
    () => filterObjectsByPartialIataCode(AIRLINES, query, 2),
    10000,
  );
  
  const newResult = benchmark(
    'Map Lookup (Optimized)',
    () => lookupAirline(query),
    10000,
  );
  
  printResult(oldResult);
  printResult(newResult);
  compareResults(oldResult, newResult);
}

console.log('\n');
console.log('='.repeat(60));
console.log('AIRCRAFT LOOKUPS (511 items)');
console.log('='.repeat(60));

for (const query of aircraftQueries) {
  console.log(`\nQuery: "${query}"`);
  
  const oldResult = benchmark(
    'Linear Filter (Old)',
    () => filterObjectsByPartialIataCode(AIRCRAFT, query, 3),
    10000,
  );
  
  const newResult = benchmark(
    'Map Lookup (Optimized)',
    () => lookupAircraft(query),
    10000,
  );
  
  printResult(oldResult);
  printResult(newResult);
  compareResults(oldResult, newResult);
}

console.log('\n');
console.log('='.repeat(60));
console.log('BENCHMARK COMPLETE');
console.log('='.repeat(60));
console.log('\nSummary:');
console.log(`- Index build time: ${formatTime(indexTime)} (one-time cost at startup)`);
console.log(`- Data sizes: ${AIRPORTS.length} airports, ${AIRLINES.length} airlines, ${AIRCRAFT.length} aircraft`);
console.log('- All tests run with 10,000 iterations per query');
console.log('- Optimized lookups use pre-built Map indexes for O(1) access');
console.log('- Old implementation uses linear array filter for O(n) access');
console.log('\n');
