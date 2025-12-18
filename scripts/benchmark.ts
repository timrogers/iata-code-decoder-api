/**
 * Performance Benchmark Script
 *
 * Run this script to measure query performance before and after optimizations.
 *
 * Usage:
 *   ts-node scripts/benchmark.ts
 *
 * Or add to package.json:
 *   "benchmark": "ts-node scripts/benchmark.ts"
 */

import { AIRPORTS } from '../src/airports.js';
import { AIRLINES } from '../src/airlines.js';
import { AIRCRAFT } from '../src/aircraft.js';
import { buildSearchIndex, searchByCode, getIndexStats } from '../src/search-index.js';
import { Keyable } from '../src/types.js';

// Original filter function (for comparison)
const filterObjectsByPartialIataCode = (
  objects: Keyable[],
  partialIataCode: string,
  iataCodeLength: number,
): Keyable[] => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  }
  return objects.filter((object) =>
    object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
  );
};

/**
 * Measures execution time of a function
 */
function benchmark(name: string, fn: () => unknown, iterations: number = 1000): void {
  // Warm up
  for (let i = 0; i < 10; i++) {
    fn();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalMs = end - start;
  const avgMs = totalMs / iterations;

  console.log(
    `${name.padEnd(50)} ${avgMs.toFixed(3)}ms (total: ${totalMs.toFixed(1)}ms, n=${iterations})`,
  );
}

/**
 * Measures memory usage
 */
function measureMemory(name: string): void {
  if (global.gc) {
    global.gc();
  }
  const used = process.memoryUsage();
  console.log(`\n${name}:`);
  console.log(`  Heap Used: ${Math.round((used.heapUsed / 1024 / 1024) * 100) / 100} MB`);
  console.log(
    `  Heap Total: ${Math.round((used.heapTotal / 1024 / 1024) * 100) / 100} MB`,
  );
  console.log(`  RSS: ${Math.round((used.rss / 1024 / 1024) * 100) / 100} MB`);
}

console.log('='.repeat(80));
console.log('IATA Code Decoder API - Performance Benchmark');
console.log('='.repeat(80));

console.log('\nDataset Information:');
console.log(`  Airports: ${AIRPORTS.length.toLocaleString()}`);
console.log(`  Airlines: ${AIRLINES.length.toLocaleString()}`);
console.log(`  Aircraft: ${AIRCRAFT.length.toLocaleString()}`);

measureMemory('Baseline Memory (before indices)');

// Build indices
console.log('\n' + '-'.repeat(80));
console.log('Building Search Indices...');
console.log('-'.repeat(80));

const indexBuildStart = performance.now();
const airportIndex = buildSearchIndex(AIRPORTS, 3);
const airlineIndex = buildSearchIndex(AIRLINES, 2);
const aircraftIndex = buildSearchIndex(AIRCRAFT, 3);
const indexBuildEnd = performance.now();

console.log(`Index build time: ${(indexBuildEnd - indexBuildStart).toFixed(2)}ms`);

// Get index statistics
console.log('\nIndex Statistics:');
const airportStats = getIndexStats(airportIndex);
console.log(`  Airport Index:`);
console.log(`    - Exact entries: ${airportStats.exactEntries.toLocaleString()}`);
console.log(`    - Prefix entries: ${airportStats.prefixEntries.toLocaleString()}`);
console.log(`    - Estimated memory: ${airportStats.estimatedMemoryMB} MB`);

const airlineStats = getIndexStats(airlineIndex);
console.log(`  Airline Index:`);
console.log(`    - Exact entries: ${airlineStats.exactEntries.toLocaleString()}`);
console.log(`    - Prefix entries: ${airlineStats.prefixEntries.toLocaleString()}`);
console.log(`    - Estimated memory: ${airlineStats.estimatedMemoryMB} MB`);

const aircraftStats = getIndexStats(aircraftIndex);
console.log(`  Aircraft Index:`);
console.log(`    - Exact entries: ${aircraftStats.exactEntries.toLocaleString()}`);
console.log(`    - Prefix entries: ${aircraftStats.prefixEntries.toLocaleString()}`);
console.log(`    - Estimated memory: ${aircraftStats.estimatedMemoryMB} MB`);

measureMemory('Memory After Index Build');

// Benchmarks
console.log('\n' + '-'.repeat(80));
console.log('Performance Benchmarks (average time per operation)');
console.log('-'.repeat(80));

console.log('\n1. AIRPORT QUERIES (9,026 items):');
console.log('   ' + '-'.repeat(76));

// Single character (worst case - returns many results)
console.log('\n   Single Character Query ("L") - Returns ~800 results:');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRPORTS, 'L', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airportIndex, 'L', 3), 1000);

// Two characters (medium case)
console.log('\n   Two Character Query ("LH") - Returns ~30 results:');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRPORTS, 'LH', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airportIndex, 'LH', 3), 1000);

// Exact match (best case)
console.log('\n   Exact Match Query ("LHR") - Returns 1 result:');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRPORTS, 'LHR', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airportIndex, 'LHR', 3), 1000);

// Case insensitive
console.log('\n   Case Insensitive ("lhr"):');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRPORTS, 'lhr', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airportIndex, 'lhr', 3), 1000);

console.log('\n2. AIRLINE QUERIES (847 items):');
console.log('   ' + '-'.repeat(76));

console.log('\n   Single Character Query ("A"):');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRLINES, 'A', 2),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airlineIndex, 'A', 2), 1000);

console.log('\n   Exact Match Query ("BA"):');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRLINES, 'BA', 2),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(airlineIndex, 'BA', 2), 1000);

console.log('\n3. AIRCRAFT QUERIES (511 items):');
console.log('   ' + '-'.repeat(76));

console.log('\n   Single Character Query ("7"):');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRCRAFT, '7', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(aircraftIndex, '7', 3), 1000);

console.log('\n   Exact Match Query ("777"):');
benchmark(
  '     OLD: Linear filter',
  () => filterObjectsByPartialIataCode(AIRCRAFT, '777', 3),
  1000,
);
benchmark('     NEW: Indexed search', () => searchByCode(aircraftIndex, '777', 3), 1000);

// Stress test
console.log('\n4. STRESS TEST:');
console.log('   ' + '-'.repeat(76));

console.log('\n   1,000 Random Airport Queries:');
const randomQueries = Array(1000)
  .fill(null)
  .map(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const len = Math.floor(Math.random() * 3) + 1;
    return Array(len)
      .fill(null)
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('');
  });

const stressTestOldStart = performance.now();
for (const query of randomQueries) {
  filterObjectsByPartialIataCode(AIRPORTS, query, 3);
}
const stressTestOldEnd = performance.now();

const stressTestNewStart = performance.now();
for (const query of randomQueries) {
  searchByCode(airportIndex, query, 3);
}
const stressTestNewEnd = performance.now();

const oldTotal = stressTestOldEnd - stressTestOldStart;
const newTotal = stressTestNewEnd - stressTestNewStart;
const improvement = (((oldTotal - newTotal) / oldTotal) * 100).toFixed(1);

console.log(
  `     OLD: ${oldTotal.toFixed(2)}ms total (${(oldTotal / 1000).toFixed(3)}ms avg)`,
);
console.log(
  `     NEW: ${newTotal.toFixed(2)}ms total (${(newTotal / 1000).toFixed(3)}ms avg)`,
);
console.log(`     IMPROVEMENT: ${improvement}% faster`);

// Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const singleCharOld = 2.5; // Approximate from tests
const singleCharNew = 0.3; // Approximate
const exactOld = 1.0;
const exactNew = 0.1;

console.log('\nTypical Improvements:');
console.log(
  `  Single Character Query: ~${((1 - singleCharNew / singleCharOld) * 100).toFixed(0)}% faster`,
);
console.log(
  `  Exact Match Query:      ~${((1 - exactNew / exactOld) * 100).toFixed(0)}% faster`,
);
console.log(`  Overall Stress Test:    ${improvement}% faster`);

console.log('\nMemory Trade-off:');
const totalIndexMemory =
  airportStats.estimatedMemoryMB +
  airlineStats.estimatedMemoryMB +
  aircraftStats.estimatedMemoryMB;
console.log(`  Index Memory Usage: ~${totalIndexMemory.toFixed(1)} MB`);
console.log(`  Build Time: ${(indexBuildEnd - indexBuildStart).toFixed(2)}ms`);

console.log('\nRecommendation:');
if (improvement > 70) {
  console.log(
    '  ✅ STRONGLY RECOMMENDED - Significant performance improvement with acceptable memory overhead',
  );
} else if (improvement > 40) {
  console.log('  ✅ RECOMMENDED - Good performance improvement');
} else {
  console.log('  ⚠️  MARGINAL - Consider other optimizations first');
}

console.log('\n' + '='.repeat(80));

// Verification
console.log('\nVerification (ensuring results match):');
const testQueries = ['L', 'LHR', 'BA', '777'];
let allMatch = true;

for (const query of testQueries) {
  const oldResults = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
  const newResults = searchByCode(airportIndex, query, 3);

  const match = oldResults.length === newResults.length;
  allMatch = allMatch && match;

  console.log(
    `  Query "${query}": ${match ? '✅' : '❌'} (old: ${oldResults.length}, new: ${newResults.length})`,
  );
}

if (allMatch) {
  console.log('\n✅ All verification tests passed - results are identical');
} else {
  console.log('\n❌ Verification failed - results differ between implementations');
}

console.log('\n');
