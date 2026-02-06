// Performance analysis script to measure data loading and filtering
import { performance } from 'perf_hooks';
import { readFileSync } from 'fs';

// Simulate current implementation
function cameliseKeys(object) {
  const snakeToCamel = (str) => str.replace(/(_[a-z])/gi, ($1) => 
    $1.toUpperCase().replace('-', '').replace('_', '')
  );
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeToCamel(key), value])
  );
}

console.log('=== IATA Code Decoder API Performance Analysis ===\n');

// Measure data loading time
console.log('1. Data Loading Performance:');
const loadStart = performance.now();
const airportsRaw = JSON.parse(readFileSync('./data/airports.json', 'utf8'));
const airlinesRaw = JSON.parse(readFileSync('./data/airlines.json', 'utf8'));
const aircraftRaw = JSON.parse(readFileSync('./data/aircraft.json', 'utf8'));
const loadEnd = performance.now();
console.log(`   - JSON parsing: ${(loadEnd - loadStart).toFixed(2)}ms`);
console.log(`   - Airports: ${airportsRaw.length} records`);
console.log(`   - Airlines: ${airlinesRaw.length} records`);
console.log(`   - Aircraft: ${aircraftRaw.length} records`);

// Measure transformation time
console.log('\n2. Data Transformation Performance:');
const transformStart = performance.now();
const airports = airportsRaw.map(airport => {
  const camelised = cameliseKeys(airport);
  if (camelised.city) {
    return Object.assign(camelised, { city: cameliseKeys(camelised.city) });
  }
  return camelised;
});
const airlines = airlinesRaw.map(cameliseKeys).filter(
  airline => airline.iataCode !== undefined && airline.iataCode !== null
);
const aircraft = aircraftRaw.map(cameliseKeys);
const transformEnd = performance.now();
console.log(`   - Transformation time: ${(transformEnd - transformStart).toFixed(2)}ms`);
console.log(`   - Airlines after filtering: ${airlines.length} records`);

// Measure filtering performance (current implementation)
console.log('\n3. Filtering Performance (Current - Linear Scan):');

function filterByPartialCode(objects, query, maxLength) {
  if (query.length > maxLength) return [];
  return objects.filter(obj => 
    obj.iataCode.toLowerCase().startsWith(query.toLowerCase())
  );
}

const queries = ['L', 'LO', 'LON', 'A', 'AA', 'AAL'];
for (const query of queries) {
  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    filterByPartialCode(airports, query, 3);
  }
  const end = performance.now();
  const results = filterByPartialCode(airports, query, 3);
  console.log(`   - Query "${query}": ${((end - start) / iterations).toFixed(3)}ms avg, ${results.length} results`);
}

// Measure with Map-based index
console.log('\n4. Filtering Performance (Optimized - Map Index):');

// Build prefix index
const buildPrefixIndex = (objects, maxLength) => {
  const index = new Map();
  for (const obj of objects) {
    const code = obj.iataCode.toLowerCase();
    for (let len = 1; len <= Math.min(code.length, maxLength); len++) {
      const prefix = code.substring(0, len);
      if (!index.has(prefix)) {
        index.set(prefix, []);
      }
      index.get(prefix).push(obj);
    }
  }
  return index;
};

const indexStart = performance.now();
const airportIndex = buildPrefixIndex(airports, 3);
const indexEnd = performance.now();
console.log(`   - Index build time: ${(indexEnd - indexStart).toFixed(2)}ms`);
console.log(`   - Index size: ${airportIndex.size} entries`);

function filterWithIndex(index, query, maxLength) {
  if (query.length > maxLength) return [];
  return index.get(query.toLowerCase()) || [];
}

for (const query of queries) {
  const iterations = 1000;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    filterWithIndex(airportIndex, query, 3);
  }
  const end = performance.now();
  const results = filterWithIndex(airportIndex, query, 3);
  console.log(`   - Query "${query}": ${((end - start) / iterations).toFixed(3)}ms avg, ${results.length} results`);
}

// Memory analysis
console.log('\n5. Memory Analysis:');
const used = process.memoryUsage();
console.log(`   - Heap Used: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Heap Total: ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - External: ${(used.external / 1024 / 1024).toFixed(2)} MB`);

// Estimate index overhead
const estimatedIndexSize = airportIndex.size * 100; // rough estimate
console.log(`   - Estimated index overhead: ~${(estimatedIndexSize / 1024).toFixed(2)} KB`);

// JSON serialization performance
console.log('\n6. JSON Serialization Performance:');
const smallResult = filterByPartialCode(airports, 'LON', 3);
const largeResult = filterByPartialCode(airports, 'L', 3);

const serializeStart1 = performance.now();
for (let i = 0; i < 1000; i++) {
  JSON.stringify({ data: smallResult });
}
const serializeEnd1 = performance.now();
console.log(`   - Small response (${smallResult.length} items): ${((serializeEnd1 - serializeStart1) / 1000).toFixed(3)}ms avg`);

const serializeStart2 = performance.now();
for (let i = 0; i < 1000; i++) {
  JSON.stringify({ data: largeResult });
}
const serializeEnd2 = performance.now();
console.log(`   - Large response (${largeResult.length} items): ${((serializeEnd2 - serializeStart2) / 1000).toFixed(3)}ms avg`);

console.log('\n=== Analysis Complete ===');
