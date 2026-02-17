// Test different optimization strategies

console.log('\n=== Testing Optimization Strategies ===\n');

// Load the data
import AIRPORTS_DATA from './data/airports.json' with { type: 'json' };
import { cameliseKeys } from './src/utils.js';

// 1. Test current cameliseKeys vs optimized version
const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

// Optimized version - avoid Object.fromEntries
const cameliseKeysOptimized = (object) => {
  const result = {};
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      result[snakeCaseToCamelCase(key)] = object[key];
    }
  }
  return result;
};

// Even more optimized - cache the transformations
const keyCache = new Map();
const cameliseKeysWithCache = (object) => {
  const result = {};
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      let camelKey = keyCache.get(key);
      if (!camelKey) {
        camelKey = snakeCaseToCamelCase(key);
        keyCache.set(key, camelKey);
      }
      result[camelKey] = object[key];
    }
  }
  return result;
};

console.log('Testing camelCase transformation performance:\n');

const iterations = 100;
const testData = AIRPORTS_DATA.slice(0, 1000);

// Test original
let start = performance.now();
for (let i = 0; i < iterations; i++) {
  testData.map(cameliseKeys);
}
let end = performance.now();
console.log(`Original cameliseKeys: ${((end - start) / iterations).toFixed(2)}ms per 1000 records`);

// Test optimized
start = performance.now();
for (let i = 0; i < iterations; i++) {
  testData.map(cameliseKeysOptimized);
}
end = performance.now();
console.log(`Optimized (for loop): ${((end - start) / iterations).toFixed(2)}ms per 1000 records`);

// Test cached
start = performance.now();
for (let i = 0; i < iterations; i++) {
  testData.map(cameliseKeysWithCache);
}
end = performance.now();
console.log(`With key cache: ${((end - start) / iterations).toFixed(2)}ms per 1000 records`);

// 2. Test prefix map vs linear filter
console.log('\n\nTesting filter strategies:\n');

import { AIRPORTS } from './src/airports.js';

// Original filter function
const filterOriginal = (objects, partialIataCode, iataCodeLength) => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

// Build a prefix map for O(1) lookups
const buildPrefixMap = (objects) => {
  const map = new Map();
  
  for (const obj of objects) {
    const code = obj.iataCode.toLowerCase();
    
    // Store for 1-char prefix
    const prefix1 = code.substring(0, 1);
    if (!map.has(prefix1)) map.set(prefix1, []);
    map.get(prefix1).push(obj);
    
    // Store for 2-char prefix
    if (code.length >= 2) {
      const prefix2 = code.substring(0, 2);
      if (!map.has(prefix2)) map.set(prefix2, []);
      map.get(prefix2).push(obj);
    }
    
    // Store for 3-char prefix (full code)
    if (code.length >= 3) {
      const prefix3 = code.substring(0, 3);
      if (!map.has(prefix3)) map.set(prefix3, []);
      map.get(prefix3).push(obj);
    }
  }
  
  return map;
};

console.log('Building prefix map...');
const prefixMapStart = performance.now();
const airportPrefixMap = buildPrefixMap(AIRPORTS);
const prefixMapEnd = performance.now();
console.log(`Prefix map build time: ${(prefixMapEnd - prefixMapStart).toFixed(2)}ms`);
console.log(`Prefix map size: ${airportPrefixMap.size} entries`);

// Calculate memory footprint
let totalMapItems = 0;
airportPrefixMap.forEach(arr => totalMapItems += arr.length);
console.log(`Total items in map: ${totalMapItems}`);

const filterWithPrefixMap = (map, partialIataCode, iataCodeLength) => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  }
  return map.get(partialIataCode.toLowerCase()) || [];
};

// Test different queries
const testQueries = ['L', 'LH', 'LHR', 'A', 'M', 'BA'];

console.log('\nQuery performance comparison:\n');

for (const query of testQueries) {
  const iterations = 10000;
  
  // Test original
  let start = performance.now();
  for (let i = 0; i < iterations; i++) {
    filterOriginal(AIRPORTS, query, 3);
  }
  let end = performance.now();
  const originalTime = ((end - start) / iterations);
  
  // Test prefix map
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    filterWithPrefixMap(airportPrefixMap, query, 3);
  }
  end = performance.now();
  const mapTime = ((end - start) / iterations);
  
  const result = filterOriginal(AIRPORTS, query, 3);
  const speedup = (originalTime / mapTime).toFixed(1);
  
  console.log(`Query "${query}" (${result.length} results):`);
  console.log(`  Original: ${originalTime.toFixed(4)}ms`);
  console.log(`  Prefix map: ${mapTime.toFixed(4)}ms (${speedup}x faster)`);
}

// 3. Test object freezing for immutability
console.log('\n\nTesting object freezing impact:\n');

const testObjects = AIRPORTS_DATA.slice(0, 100).map(cameliseKeys);
const testFrozen = testObjects.map(obj => Object.freeze({...obj}));

// Measure serialization time difference
start = performance.now();
for (let i = 0; i < 100; i++) {
  JSON.stringify({ data: testObjects });
}
end = performance.now();
console.log(`Serialization time (normal): ${((end - start) / 100).toFixed(3)}ms`);

start = performance.now();
for (let i = 0; i < 100; i++) {
  JSON.stringify({ data: testFrozen });
}
end = performance.now();
console.log(`Serialization time (frozen): ${((end - start) / 100).toFixed(3)}ms`);

console.log('\nOptimization testing complete!\n');
