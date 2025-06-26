#!/usr/bin/env node

/**
 * Manual Test Runner for IATA Code Decoder API
 * This script provides a simple way to run basic integration tests
 * without dealing with Jest/ESM configuration issues.
 */

import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.baseUrl = 'http://localhost:3000';
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async makeRequest(path, expectedStatus = 200) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const data = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: body
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  async test(name, testFn) {
    try {
      this.log(`  • ${name}`, colors.blue);
      await testFn();
      this.passed++;
      this.log(`    ✓ PASSED`, colors.green);
    } catch (error) {
      this.failed++;
      this.log(`    ✗ FAILED: ${error.message}`, colors.red);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
    }
  }

  assertContains(haystack, needle, message) {
    if (!haystack.includes(needle)) {
      throw new Error(`${message} - Expected "${haystack}" to contain "${needle}"`);
    }
  }

  async runHealthTests() {
    this.log(`\n${colors.bold}Health Check Tests${colors.reset}`);
    
    await this.test('Health check returns 200', async () => {
      const response = await this.makeRequest('/health');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assertEqual(response.data.success, true, 'Success should be true');
    });

    await this.test('Health check has proper cache headers', async () => {
      const response = await this.makeRequest('/health');
      this.assertContains(response.headers['cache-control'], 'no-store', 'Should have no-store cache control');
    });
  }

  async runAirportTests() {
    this.log(`\n${colors.bold}Airport Endpoint Tests${colors.reset}`);

    await this.test('Airport search with valid code returns data', async () => {
      const response = await this.makeRequest('/airports?query=LAX');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Airport search with partial code works', async () => {
      const response = await this.makeRequest('/airports?query=L');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Airport search without query returns 400', async () => {
      const response = await this.makeRequest('/airports', 400);
      this.assertEqual(response.status, 400, 'Status should be 400');
      this.assertContains(response.data.data.error, 'search query must be provided', 'Should contain error message');
    });

    await this.test('Airport search with empty query returns 400', async () => {
      const response = await this.makeRequest('/airports?query=', 400);
      this.assertEqual(response.status, 400, 'Status should be 400');
    });

    await this.test('Airport search with long code returns empty array', async () => {
      const response = await this.makeRequest('/airports?query=LAXX');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assertEqual(response.data.data.length, 0, 'Should return empty array');
    });
  }

  async runAirlineTests() {
    this.log(`\n${colors.bold}Airline Endpoint Tests${colors.reset}`);

    await this.test('Airline search with valid code returns data', async () => {
      const response = await this.makeRequest('/airlines?query=AA');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Airline search with partial code works', async () => {
      const response = await this.makeRequest('/airlines?query=A');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Airline search without query returns 400', async () => {
      const response = await this.makeRequest('/airlines', 400);
      this.assertEqual(response.status, 400, 'Status should be 400');
    });

    await this.test('Airline search with long code returns empty array', async () => {
      const response = await this.makeRequest('/airlines?query=AAA');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assertEqual(response.data.data.length, 0, 'Should return empty array');
    });
  }

  async runAircraftTests() {
    this.log(`\n${colors.bold}Aircraft Endpoint Tests${colors.reset}`);

    await this.test('Aircraft search with valid code returns data', async () => {
      const response = await this.makeRequest('/aircraft?query=737');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Aircraft search with partial code works', async () => {
      const response = await this.makeRequest('/aircraft?query=7');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assert(Array.isArray(response.data.data), 'Response should contain data array');
    });

    await this.test('Aircraft search without query returns 400', async () => {
      const response = await this.makeRequest('/aircraft', 400);
      this.assertEqual(response.status, 400, 'Status should be 400');
    });

    await this.test('Aircraft search with long code returns empty array', async () => {
      const response = await this.makeRequest('/aircraft?query=7370');
      this.assertEqual(response.status, 200, 'Status should be 200');
      this.assertEqual(response.data.data.length, 0, 'Should return empty array');
    });
  }

  async runPerformanceTests() {
    this.log(`\n${colors.bold}Performance Tests${colors.reset}`);

    await this.test('Health check responds within 100ms', async () => {
      const start = Date.now();
      await this.makeRequest('/health');
      const duration = Date.now() - start;
      this.assert(duration < 100, `Response took ${duration}ms, should be under 100ms`);
    });

    await this.test('Airport search responds within 200ms', async () => {
      const start = Date.now();
      await this.makeRequest('/airports?query=L');
      const duration = Date.now() - start;
      this.assert(duration < 200, `Response took ${duration}ms, should be under 200ms`);
    });
  }

  async checkServerRunning() {
    try {
      await this.makeRequest('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  async run() {
    this.log(`\n${colors.bold}${colors.blue}🛫 IATA Code Decoder API Test Suite${colors.reset}`);
    this.log(`${colors.yellow}Manual Integration Tests${colors.reset}\n`);

    // Check if server is running
    this.log('Checking if server is running...');
    const isRunning = await this.checkServerRunning();
    
    if (!isRunning) {
      this.log(`${colors.red}✗ Server is not running on http://localhost:3000${colors.reset}`);
      this.log(`${colors.yellow}Please start the server with: npm run dev${colors.reset}`);
      return;
    }
    
    this.log(`${colors.green}✓ Server is running${colors.reset}`);

    try {
      await this.runHealthTests();
      await this.runAirportTests();
      await this.runAirlineTests();
      await this.runAircraftTests();
      await this.runPerformanceTests();
    } catch (error) {
      this.log(`\n${colors.red}Test suite failed with error: ${error.message}${colors.reset}`);
    }

    // Summary
    this.log(`\n${colors.bold}Test Results:${colors.reset}`);
    this.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
    this.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
    this.log(`Total: ${this.passed + this.failed}`);

    if (this.failed === 0) {
      this.log(`\n${colors.green}${colors.bold}✓ All tests passed!${colors.reset}`);
      process.exit(0);
    } else {
      this.log(`\n${colors.red}${colors.bold}✗ ${this.failed} test(s) failed${colors.reset}`);
      process.exit(1);
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.run().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});