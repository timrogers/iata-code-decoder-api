import autocannon from 'autocannon';
import { AIRPORTS } from './src/airports.js';
import { AIRLINES } from './src/airlines.js';
import { AIRCRAFT } from './src/aircraft.js';

// Log data load statistics
console.log('\n=== Data Loading Statistics ===');
console.log(`Airports loaded: ${AIRPORTS.length}`);
console.log(`Airlines loaded: ${AIRLINES.length}`);
console.log(`Aircraft loaded: ${AIRCRAFT.length}`);

// Memory usage after data loading
const memUsage = process.memoryUsage();
console.log('\n=== Memory Usage After Data Loading ===');
console.log(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);

// Benchmark the data transformation
console.log('\n=== Testing Data Transformation Performance ===');

import { cameliseKeys } from './src/utils.js';
import AIRPORTS_DATA from './data/airports.json' with { type: 'json' };

const iterations = 10;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
  AIRPORTS_DATA.slice(0, 100).map(cameliseKeys);
}
const end = performance.now();
console.log(`Time to transform 100 airport records (avg of ${iterations} runs): ${((end - start) / iterations).toFixed(2)}ms`);

// Benchmark filtering
console.log('\n=== Testing Filter Performance ===');

const filterObjectsByPartialIataCode = (objects, partialIataCode, iataCodeLength) => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

// Test different query patterns
const queries = [
  { query: 'L', desc: 'Single char (many results)' },
  { query: 'LH', desc: 'Two chars (fewer results)' },
  { query: 'LHR', desc: 'Three chars (exact match)' },
  { query: 'JFK', desc: 'Three chars (exact match)' },
  { query: 'A', desc: 'Single char A (most common)' },
];

for (const { query, desc } of queries) {
  const start = performance.now();
  const iterations = 1000;
  for (let i = 0; i < iterations; i++) {
    filterObjectsByPartialIataCode(AIRPORTS, query, 3);
  }
  const end = performance.now();
  const result = filterObjectsByPartialIataCode(AIRPORTS, query, 3);
  console.log(`Query "${query}" (${desc}): ${((end - start) / iterations).toFixed(3)}ms avg, ${result.length} results`);
}

console.log('\n=== Starting HTTP Performance Tests ===\n');

// Start the server
const startServer = async () => {
  const app = (await import('./src/api.js')).default;
  await app.listen({ port: 3001, host: '0.0.0.0' });
  return app;
};

const runBenchmarks = async () => {
  const app = await startServer();
  
  const tests = [
    {
      name: 'Health Check',
      url: 'http://localhost:3001/health',
    },
    {
      name: 'Airports - Single char query (L)',
      url: 'http://localhost:3001/airports?query=L',
    },
    {
      name: 'Airports - Two char query (LH)',
      url: 'http://localhost:3001/airports?query=LH',
    },
    {
      name: 'Airports - Exact match (LHR)',
      url: 'http://localhost:3001/airports?query=LHR',
    },
    {
      name: 'Airlines - All (no query)',
      url: 'http://localhost:3001/airlines',
    },
    {
      name: 'Airlines - Two char query (BA)',
      url: 'http://localhost:3001/airlines?query=BA',
    },
    {
      name: 'Aircraft - Three char query (777)',
      url: 'http://localhost:3001/aircraft?query=777',
    },
  ];

  for (const test of tests) {
    console.log(`\nRunning: ${test.name}`);
    console.log('='.repeat(60));
    
    const result = await autocannon({
      url: test.url,
      connections: 10,
      duration: 10,
      pipelining: 1,
    });
    
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Latency (avg): ${result.latency.mean.toFixed(2)}ms`);
    console.log(`Latency (p99): ${result.latency.p99.toFixed(2)}ms`);
    console.log(`Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/sec`);
  }
  
  await app.close();
};

runBenchmarks().catch(console.error);
