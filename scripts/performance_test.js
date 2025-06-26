#!/usr/bin/env node

// Simple performance testing script for the IATA Code Decoder API
import http from 'http';
import { performance } from 'perf_hooks';

const API_BASE_URL = 'http://localhost:3000';
const TEST_QUERIES = [
  'LAX', 'JFK', 'LHR', 'CDG', 'DXB', 'NRT', 'SYD', 'FRA', 'AMS', 'MAD',
  'AA', 'BA', 'LH', 'AF', 'UA', 'DL', 'SW', 'KL', 'IB', 'QF',
  '737', '747', '777', '787', 'A320', 'A330', 'A350', 'A380'
];

const ENDPOINTS = ['airports', 'airlines', 'aircraft'];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            responseTime,
            dataLength: data.length,
            resultCount: jsonData.data ? jsonData.data.length : 0,
            headers: res.headers
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function runPerformanceTest() {
  console.log('🚀 Starting IATA Code Decoder API Performance Test');
  console.log('=' .repeat(60));
  
  const results = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    cacheHits: 0,
    responses: []
  };

  // Test each endpoint with various queries
  for (const endpoint of ENDPOINTS) {
    console.log(`\n📊 Testing ${endpoint} endpoint...`);
    
    for (const query of TEST_QUERIES.slice(0, 10)) { // Limit for demo
      try {
        const url = `${API_BASE_URL}/${endpoint}?query=${query}`;
        const result = await makeRequest(url);
        
        results.totalRequests++;
        results.successfulRequests++;
        results.totalResponseTime += result.responseTime;
        results.minResponseTime = Math.min(results.minResponseTime, result.responseTime);
        results.maxResponseTime = Math.max(results.maxResponseTime, result.responseTime);
        
        // Check if response was cached (very fast response indicates cache hit)
        if (result.responseTime < 5) {
          results.cacheHits++;
        }
        
        results.responses.push({
          endpoint,
          query,
          ...result
        });
        
        console.log(`  ✅ ${query}: ${result.responseTime.toFixed(2)}ms (${result.resultCount} results)`);
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        results.totalRequests++;
        results.failedRequests++;
        console.log(`  ❌ ${query}: Failed - ${error.message}`);
      }
    }
  }

  // Test cache performance by repeating some queries
  console.log('\n🔄 Testing cache performance (repeating queries)...');
  for (let i = 0; i < 5; i++) {
    const query = TEST_QUERIES[i % TEST_QUERIES.length];
    const endpoint = ENDPOINTS[i % ENDPOINTS.length];
    
    try {
      const url = `${API_BASE_URL}/${endpoint}?query=${query}`;
      const result = await makeRequest(url);
      
      results.totalRequests++;
      results.successfulRequests++;
      results.totalResponseTime += result.responseTime;
      
      if (result.responseTime < 5) {
        results.cacheHits++;
      }
      
      console.log(`  🔄 ${endpoint}/${query}: ${result.responseTime.toFixed(2)}ms (cached: ${result.responseTime < 5 ? 'YES' : 'NO'})`);
      
    } catch (error) {
      results.totalRequests++;
      results.failedRequests++;
      console.log(`  ❌ ${endpoint}/${query}: Failed - ${error.message}`);
    }
  }

  // Calculate statistics
  const avgResponseTime = results.totalResponseTime / results.successfulRequests;
  const successRate = (results.successfulRequests / results.totalRequests) * 100;
  const cacheHitRate = (results.cacheHits / results.successfulRequests) * 100;

  // Print results
  console.log('\n📈 Performance Test Results');
  console.log('=' .repeat(60));
  console.log(`Total Requests: ${results.totalRequests}`);
  console.log(`Successful: ${results.successfulRequests}`);
  console.log(`Failed: ${results.failedRequests}`);
  console.log(`Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`Cache Hit Rate: ${cacheHitRate.toFixed(2)}%`);
  console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Min Response Time: ${results.minResponseTime.toFixed(2)}ms`);
  console.log(`Max Response Time: ${results.maxResponseTime.toFixed(2)}ms`);
  
  // Performance Assessment
  console.log('\n🎯 Performance Assessment:');
  if (avgResponseTime < 50) {
    console.log('✅ Excellent performance! Average response time under 50ms');
  } else if (avgResponseTime < 100) {
    console.log('✅ Good performance! Average response time under 100ms');
  } else if (avgResponseTime < 200) {
    console.log('⚠️  Acceptable performance. Room for improvement.');
  } else {
    console.log('❌ Poor performance. Optimization needed.');
  }
  
  if (cacheHitRate > 50) {
    console.log('✅ Cache is working effectively!');
  } else if (cacheHitRate > 20) {
    console.log('⚠️  Cache is working but could be improved');
  } else {
    console.log('❌ Cache may not be working properly');
  }

  // Try to get metrics from the API
  try {
    console.log('\n📊 API Metrics:');
    const metricsResult = await makeRequest(`${API_BASE_URL}/metrics`);
    const metrics = JSON.parse(metricsResult.data || '{}');
    console.log(`Server Cache Hit Rate: ${metrics.cacheHitRate || 'N/A'}`);
    console.log(`Server Average Response Time: ${metrics.avgResponseTime?.toFixed(2) || 'N/A'}ms`);
    console.log(`Server Total Requests: ${metrics.totalRequests || 'N/A'}`);
    console.log(`Server Uptime: ${metrics.uptime?.toFixed(2) || 'N/A'}s`);
  } catch (error) {
    console.log('⚠️  Could not fetch server metrics');
  }
}

// Run the test
if (process.argv[1].includes('performance_test.js')) {
  runPerformanceTest().catch(console.error);
}