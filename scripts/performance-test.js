import { performance } from 'perf_hooks';
import { searchAirports } from '../src/airports.js';
import { searchAirlines } from '../src/airlines.js';
import { searchAircraft } from '../src/aircraft.js';

// Test queries for different scenarios
const testQueries = {
  airports: ['LAX', 'JFK', 'LHR', 'A', 'NY', 'LON', 'DEN', 'ATL'],
  airlines: ['AA', 'UA', 'BA', 'A', 'L', 'U', 'SW', 'DL'],
  aircraft: ['737', '320', 'A38', '7', '3', 'A', 'B77', 'E90']
};

const runPerformanceTest = (searchFunction, queries, testName) => {
  console.log(`\n📊 Testing ${testName}:`);
  console.log('='.repeat(40));
  
  const results = [];
  
  // Warm up - first runs to populate caches
  console.log('🔥 Warming up cache...');
  queries.forEach(query => searchFunction(query));
  
  // Test each query multiple times
  queries.forEach(query => {
    const iterations = 100;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const result = searchFunction(query);
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
    
    results.push({
      query,
      avgTime: avgTime.toFixed(3),
      minTime: minTime.toFixed(3),
      maxTime: maxTime.toFixed(3),
      medianTime: medianTime.toFixed(3),
      resultCount: searchFunction(query).length
    });
  });
  
  // Display results
  console.log('\nQuery  | Avg (ms) | Min (ms) | Max (ms) | Median (ms) | Results');
  console.log('-'.repeat(65));
  results.forEach(r => {
    console.log(`${r.query.padEnd(6)} | ${r.avgTime.padStart(8)} | ${r.minTime.padStart(8)} | ${r.maxTime.padStart(8)} | ${r.medianTime.padStart(11)} | ${r.resultCount.toString().padStart(7)}`);
  });
  
  // Calculate overall stats
  const overallAvg = results.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / results.length;
  console.log('-'.repeat(65));
  console.log(`Overall average: ${overallAvg.toFixed(3)}ms`);
  
  return results;
};

const runMemoryTest = () => {
  console.log('\n🧠 Memory Usage Test:');
  console.log('='.repeat(40));
  
  const used = process.memoryUsage();
  console.log(`RSS: ${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`);
  console.log(`Heap Total: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
  console.log(`Heap Used: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
  console.log(`External: ${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`);
};

const main = () => {
  console.log('🚀 IATA Code Decoder API Performance Test');
  console.log('=========================================');
  
  runMemoryTest();
  
  // Run performance tests
  const airportResults = runPerformanceTest(searchAirports, testQueries.airports, 'Airports');
  const airlineResults = runPerformanceTest(searchAirlines, testQueries.airlines, 'Airlines');
  const aircraftResults = runPerformanceTest(searchAircraft, testQueries.aircraft, 'Aircraft');
  
  console.log('\n📈 Summary:');
  console.log('='.repeat(40));
  console.log(`✅ Airport searches: avg ${(airportResults.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / airportResults.length).toFixed(3)}ms`);
  console.log(`✅ Airline searches: avg ${(airlineResults.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / airlineResults.length).toFixed(3)}ms`);
  console.log(`✅ Aircraft searches: avg ${(aircraftResults.reduce((sum, r) => sum + parseFloat(r.avgTime), 0) / aircraftResults.length).toFixed(3)}ms`);
  
  runMemoryTest();
  
  console.log('\n🎯 Performance optimizations applied:');
  console.log('- ✅ Index-based search (O(1) for exact matches, O(k) for prefix matches)');
  console.log('- ✅ In-memory result caching with TTL');
  console.log('- ✅ Pre-built prefix maps for fast lookups');
  console.log('- ✅ Input validation and sanitization');
  console.log('- ✅ Response compression and caching headers');
  console.log('- ✅ Error handling and monitoring');
};

main();