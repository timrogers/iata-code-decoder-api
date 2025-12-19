#!/usr/bin/env node
/**
 * Performance Benchmark Script
 * Compares Express vs Fastify performance using autocannon
 */

const autocannon = require('autocannon');
const chalk = require('chalk');
const Table = require('cli-table3');

class PerformanceBenchmark {
  constructor(expressUrl, fastifyUrl, options = {}) {
    this.expressUrl = expressUrl;
    this.fastifyUrl = fastifyUrl;
    this.duration = options.duration || 10;
    this.connections = options.connections || 10;
    this.pipelining = options.pipelining || 1;
    this.results = {};
  }

  async runBenchmark(name, url, method = 'GET', body = null) {
    console.log(chalk.blue(`\n⚡ Benchmarking ${name}...`));

    const config = {
      url,
      method,
      duration: this.duration,
      connections: this.connections,
      pipelining: this.pipelining,
      headers: {
        'content-type': 'application/json',
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    return new Promise((resolve, reject) => {
      autocannon(config, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async compareEndpoint(path, method = 'GET', body = null) {
    console.log(chalk.yellow(`\n${'='.repeat(70)}`));
    console.log(chalk.yellow(`Testing: ${method} ${path}`));
    console.log(chalk.yellow('='.repeat(70)));

    try {
      // Benchmark Express
      const expressResult = await this.runBenchmark(
        'Express',
        `${this.expressUrl}${path}`,
        method,
        body,
      );

      // Benchmark Fastify
      const fastifyResult = await this.runBenchmark(
        'Fastify',
        `${this.fastifyUrl}${path}`,
        method,
        body,
      );

      // Calculate improvements
      const improvement = {
        requests: (
          ((fastifyResult.requests.average - expressResult.requests.average) /
            expressResult.requests.average) *
          100
        ).toFixed(2),
        latency: (
          ((expressResult.latency.mean - fastifyResult.latency.mean) /
            expressResult.latency.mean) *
          100
        ).toFixed(2),
        throughput: (
          ((fastifyResult.throughput.average - expressResult.throughput.average) /
            expressResult.throughput.average) *
          100
        ).toFixed(2),
      };

      // Store results
      this.results[`${method} ${path}`] = {
        express: {
          requests: expressResult.requests.average,
          latency: expressResult.latency.mean,
          throughput: expressResult.throughput.average,
          errors: expressResult.errors,
        },
        fastify: {
          requests: fastifyResult.requests.average,
          latency: fastifyResult.latency.mean,
          throughput: fastifyResult.throughput.average,
          errors: fastifyResult.errors,
        },
        improvement,
      };

      // Display results table
      this.displayComparison(expressResult, fastifyResult, improvement);

      return this.results[`${method} ${path}`];
    } catch (error) {
      console.error(chalk.red(`Error benchmarking ${path}:`, error.message));
      throw error;
    }
  }

  displayComparison(expressResult, fastifyResult, improvement) {
    const table = new Table({
      head: ['Metric', 'Express', 'Fastify', 'Improvement'],
      colWidths: [25, 20, 20, 20],
      style: {
        head: ['cyan'],
      },
    });

    table.push(
      [
        'Requests/sec',
        expressResult.requests.average.toFixed(2),
        fastifyResult.requests.average.toFixed(2),
        chalk.green(`+${improvement.requests}%`),
      ],
      [
        'Latency (ms)',
        expressResult.latency.mean.toFixed(2),
        fastifyResult.latency.mean.toFixed(2),
        chalk.green(`-${improvement.latency}%`),
      ],
      [
        'Throughput (bytes/sec)',
        this.formatBytes(expressResult.throughput.average),
        this.formatBytes(fastifyResult.throughput.average),
        chalk.green(`+${improvement.throughput}%`),
      ],
      ['Errors', expressResult.errors || 0, fastifyResult.errors || 0, '-'],
    );

    console.log(table.toString());
  }

  formatBytes(bytes) {
    if (bytes < 1024) return bytes.toFixed(2) + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  displaySummary() {
    console.log(chalk.yellow(`\n${'='.repeat(70)}`));
    console.log(chalk.yellow.bold('📊 SUMMARY'));
    console.log(chalk.yellow('='.repeat(70)));

    const endpoints = Object.keys(this.results);

    if (endpoints.length === 0) {
      console.log(chalk.red('No results to display'));
      return;
    }

    const avgImprovements = {
      requests: 0,
      latency: 0,
      throughput: 0,
    };

    endpoints.forEach((endpoint) => {
      const result = this.results[endpoint];
      avgImprovements.requests += parseFloat(result.improvement.requests);
      avgImprovements.latency += parseFloat(result.improvement.latency);
      avgImprovements.throughput += parseFloat(result.improvement.throughput);
    });

    avgImprovements.requests /= endpoints.length;
    avgImprovements.latency /= endpoints.length;
    avgImprovements.throughput /= endpoints.length;

    console.log(`\n${chalk.bold('Average Performance Improvements:')}`);
    console.log(
      `  ${chalk.green('✓')} Requests/sec:  ${chalk.green('+' + avgImprovements.requests.toFixed(2) + '%')}`,
    );
    console.log(
      `  ${chalk.green('✓')} Latency:       ${chalk.green('-' + avgImprovements.latency.toFixed(2) + '%')}`,
    );
    console.log(
      `  ${chalk.green('✓')} Throughput:    ${chalk.green('+' + avgImprovements.throughput.toFixed(2) + '%')}`,
    );

    console.log(`\n${chalk.bold('Tested Endpoints:')}`);
    endpoints.forEach((endpoint) => {
      console.log(`  - ${endpoint}`);
    });

    console.log(chalk.yellow(`\n${'='.repeat(70)}\n`));
  }

  exportResults(filename = 'benchmark_results.json') {
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(chalk.green(`\n✅ Results exported to ${filename}`));
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      chalk.red('Usage: node benchmark.js <express-url> <fastify-url> [options]'),
    );
    console.log('Example: node benchmark.js http://localhost:3000 http://localhost:3001');
    process.exit(1);
  }

  const [expressUrl, fastifyUrl] = args;

  const benchmark = new PerformanceBenchmark(expressUrl, fastifyUrl, {
    duration: 10,
    connections: 10,
    pipelining: 1,
  });

  // Define endpoints to test
  const endpoints = [
    { path: '/', method: 'GET' },
    { path: '/api/users', method: 'GET' },
    { path: '/api/users/123', method: 'GET' },
    {
      path: '/api/users',
      method: 'POST',
      body: { name: 'Test User', email: 'test@example.com' },
    },
  ];

  console.log(chalk.cyan.bold('\n🚀 Fastify Migration Performance Benchmark'));
  console.log(chalk.cyan(`Duration: ${benchmark.duration}s per test`));
  console.log(chalk.cyan(`Connections: ${benchmark.connections}`));
  console.log(chalk.cyan(`Pipelining: ${benchmark.pipelining}\n`));

  // Run benchmarks
  for (const endpoint of endpoints) {
    try {
      await benchmark.compareEndpoint(endpoint.path, endpoint.method, endpoint.body);
    } catch (error) {
      console.error(chalk.red(`Failed to benchmark ${endpoint.path}:`, error.message));
    }
  }

  benchmark.displaySummary();
  benchmark.exportResults();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(chalk.red('Benchmark failed:', err));
    process.exit(1);
  });
}

module.exports = PerformanceBenchmark;
