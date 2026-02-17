#!/usr/bin/env node
/**
 * Benchmark script to compare current vs optimized implementation
 * 
 * Usage:
 *   npm run benchmark
 * 
 * This will:
 * 1. Start the current server
 * 2. Run benchmarks
 * 3. Stop the server
 * 4. Start the optimized server
 * 5. Run benchmarks
 * 6. Compare results
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const BENCHMARK_DURATION = 10; // seconds
const CONCURRENT_CONNECTIONS = 10;

const endpoints = [
  { path: '/airports?query=L', name: 'Airports (single char)' },
  { path: '/airports?query=LH', name: 'Airports (two chars)' },
  { path: '/airports?query=LHR', name: 'Airports (exact match)' },
  { path: '/airlines?query=B', name: 'Airlines (single char)' },
  { path: '/airlines?query=BA', name: 'Airlines (exact match)' },
];

function runAutocannon(url, name) {
  return new Promise((resolve, reject) => {
    console.log(`\n📊 Benchmarking: ${name}`);
    console.log(`   URL: ${url}`);
    
    const args = [
      '-c', CONCURRENT_CONNECTIONS.toString(),
      '-d', BENCHMARK_DURATION.toString(),
      '--json',
      url
    ];

    const proc = spawn('npx', ['autocannon', ...args], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Autocannon exited with code ${code}`));
        return;
      }

      try {
        const results = JSON.parse(output);
        const summary = {
          name,
          requests: results.requests.total,
          requestsPerSec: results.requests.mean,
          latencyAvg: results.latency.mean,
          latencyP95: results.latency.p95,
          latencyP99: results.latency.p99,
          throughputBytes: results.throughput.mean,
        };

        console.log(`   ✓ ${summary.requestsPerSec.toFixed(0)} req/sec`);
        console.log(`   ✓ Latency: avg=${summary.latencyAvg.toFixed(2)}ms p95=${summary.latencyP95.toFixed(2)}ms`);
        
        resolve(summary);
      } catch (err) {
        reject(new Error(`Failed to parse autocannon output: ${err.message}`));
      }
    });
  });
}

async function startServer(port, optimized = false) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PORT: port.toString() };
    
    // Modify the index.ts temporarily if testing optimized version
    if (optimized) {
      const indexContent = readFileSync('src/index.ts', 'utf8');
      const modifiedContent = indexContent.replace(
        "import app from './api.js';",
        "import app from './api-optimized.js';"
      );
      writeFileSync('src/index.ts.bak', indexContent);
      writeFileSync('src/index.ts', modifiedContent);
    }

    const proc = spawn('npm', ['start'], { env, stdio: 'inherit' });

    // Wait for server to start
    setTimeout(() => {
      resolve(proc);
    }, 3000);

    proc.on('error', reject);
  });
}

function stopServer(proc) {
  return new Promise((resolve) => {
    if (!proc) {
      resolve();
      return;
    }

    proc.on('close', resolve);
    proc.kill();
    
    // Force kill after 5 seconds
    setTimeout(() => {
      proc.kill('SIGKILL');
      resolve();
    }, 5000);
  });
}

function restoreIndex() {
  try {
    const backup = readFileSync('src/index.ts.bak', 'utf8');
    writeFileSync('src/index.ts', backup);
    unlinkSync('src/index.ts.bak');
  } catch (err) {
    // Backup doesn't exist, nothing to restore
  }
}

async function runBenchmarkSuite(baseUrl, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Running ${label}`);
  console.log('='.repeat(60));

  const results = [];
  for (const endpoint of endpoints) {
    const result = await runAutocannon(`${baseUrl}${endpoint.path}`, endpoint.name);
    results.push(result);
  }

  return results;
}

function compareResults(currentResults, optimizedResults) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('📈 PERFORMANCE COMPARISON');
  console.log('='.repeat(60));

  console.log('\n| Endpoint | Current | Optimized | Improvement |');
  console.log('|----------|---------|-----------|-------------|');

  for (let i = 0; i < currentResults.length; i++) {
    const current = currentResults[i];
    const optimized = optimizedResults[i];
    const improvement = ((optimized.requestsPerSec / current.requestsPerSec - 1) * 100).toFixed(1);
    
    console.log(
      `| ${current.name.padEnd(25)} | ` +
      `${current.requestsPerSec.toFixed(0).padStart(7)} | ` +
      `${optimized.requestsPerSec.toFixed(0).padStart(9)} | ` +
      `${improvement > 0 ? '+' : ''}${improvement}% |`
    );
  }

  console.log('\n');
  console.log('Latency Comparison (avg ms):');
  console.log('| Endpoint | Current | Optimized | Improvement |');
  console.log('|----------|---------|-----------|-------------|');

  for (let i = 0; i < currentResults.length; i++) {
    const current = currentResults[i];
    const optimized = optimizedResults[i];
    const improvement = ((1 - optimized.latencyAvg / current.latencyAvg) * 100).toFixed(1);
    
    console.log(
      `| ${current.name.padEnd(25)} | ` +
      `${current.latencyAvg.toFixed(2).padStart(7)} | ` +
      `${optimized.latencyAvg.toFixed(2).padStart(9)} | ` +
      `${improvement > 0 ? '-' : '+'}${Math.abs(parseFloat(improvement))}% |`
    );
  }
}

async function main() {
  console.log('🔧 IATA Code Decoder API - Performance Benchmark\n');

  let currentServer, optimizedServer;

  try {
    // Benchmark current implementation
    console.log('\n1️⃣  Starting current server...');
    currentServer = await startServer(3000, false);
    const currentResults = await runBenchmarkSuite('http://localhost:3000', 'Current Implementation');
    await stopServer(currentServer);

    // Benchmark optimized implementation  
    console.log('\n2️⃣  Starting optimized server...');
    optimizedServer = await startServer(3001, true);
    const optimizedResults = await runBenchmarkSuite('http://localhost:3001', 'Optimized Implementation');
    await stopServer(optimizedServer);

    // Compare results
    compareResults(currentResults, optimizedResults);

    console.log('\n✅ Benchmark complete!\n');
  } catch (err) {
    console.error('\n❌ Benchmark failed:', err.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (currentServer) await stopServer(currentServer);
    if (optimizedServer) await stopServer(optimizedServer);
    restoreIndex();
  }
}

main();
