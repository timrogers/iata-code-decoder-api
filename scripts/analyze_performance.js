#!/usr/bin/env node

/**
 * Performance Analysis Script
 * 
 * This script analyzes various performance aspects of the IATA Code Decoder API:
 * - Data loading and transformation time
 * - Memory usage
 * - Filter operation performance
 * - Index creation time (for optimization suggestions)
 */

import { performance } from 'node:perf_hooks';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../data');

// Utility function to format bytes
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Utility function to format time
function formatTime(ms) {
  if (ms < 1) return (ms * 1000).toFixed(2) + ' μs';
  if (ms < 1000) return ms.toFixed(2) + ' ms';
  return (ms / 1000).toFixed(2) + ' s';
}

// Measure memory usage
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
  };
}

// Camelization utility (from utils.ts)
const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const cameliseKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

// Filter function (from api.ts)
const filterObjectsByPartialIataCode = (
  objects,
  partialIataCode,
  iataCodeLength,
) => {
  if (partialIataCode.length > iataCodeLength) {
    return [];
  } else {
    return objects.filter((object) =>
      object.iataCode.toLowerCase().startsWith(partialIataCode.toLowerCase()),
    );
  }
};

// Test case scenarios
const testQueries = {
  airports: ['L', 'LH', 'LHR', 'Z', 'ZZ', 'ZZZ', 'A', 'AA', 'AAA'],
  airlines: ['B', 'BA', 'A', 'AA', 'Z', 'ZZ'],
  aircraft: ['7', '77', '777', 'A', 'A3', 'A32'],
};

async function analyzeDataLoading() {
  console.log('\n=== DATA LOADING ANALYSIS ===\n');

  const files = ['airports.json', 'airlines.json', 'aircraft.json'];
  const results = {};

  for (const file of files) {
    const filePath = join(dataDir, file);
    const memBefore = getMemoryUsage();

    // Measure file reading
    const readStart = performance.now();
    const rawData = await readFile(filePath, 'utf-8');
    const readEnd = performance.now();

    // Measure JSON parsing
    const parseStart = performance.now();
    const jsonData = JSON.parse(rawData);
    const parseEnd = performance.now();

    // Measure transformation (camelization)
    const transformStart = performance.now();
    const transformedData = jsonData.map(cameliseKeys);
    const transformEnd = performance.now();

    const memAfter = getMemoryUsage();

    results[file] = {
      fileSize: Buffer.byteLength(rawData, 'utf-8'),
      recordCount: jsonData.length,
      readTime: readEnd - readStart,
      parseTime: parseEnd - parseStart,
      transformTime: transformEnd - transformStart,
      totalTime: readEnd - readStart + parseEnd - parseStart + transformEnd - transformStart,
      memoryIncrease: memAfter.heapUsed - memBefore.heapUsed,
      data: transformedData,
    };

    console.log(`${file}:`);
    console.log(`  File size: ${formatBytes(results[file].fileSize)}`);
    console.log(`  Record count: ${results[file].recordCount.toLocaleString()}`);
    console.log(`  Read time: ${formatTime(results[file].readTime)}`);
    console.log(`  Parse time: ${formatTime(results[file].parseTime)}`);
    console.log(`  Transform time: ${formatTime(results[file].transformTime)}`);
    console.log(`  Total load time: ${formatTime(results[file].totalTime)}`);
    console.log(`  Memory increase: ${formatBytes(results[file].memoryIncrease)}`);
    console.log('');
  }

  return results;
}

async function analyzeFiltering(loadedData) {
  console.log('\n=== FILTERING PERFORMANCE ANALYSIS ===\n');

  const datasets = {
    airports: { data: loadedData['airports.json'].data, codeLength: 3 },
    airlines: { 
      data: loadedData['airlines.json'].data.filter(a => a.iataCode != null), 
      codeLength: 2 
    },
    aircraft: { data: loadedData['aircraft.json'].data, codeLength: 3 },
  };

  for (const [dataType, { data, codeLength }] of Object.entries(datasets)) {
    console.log(`${dataType.toUpperCase()}:`);
    console.log(`  Dataset size: ${data.length.toLocaleString()} records\n`);

    const queries = testQueries[dataType];
    const iterations = 1000; // Run each query 1000 times for accurate timing

    for (const query of queries) {
      const times = [];
      let lastResult;

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        lastResult = filterObjectsByPartialIataCode(data, query, codeLength);
        times.push(performance.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`  Query "${query}":`);
      console.log(`    Results: ${lastResult.length}`);
      console.log(`    Avg time: ${formatTime(avgTime)} (${iterations} iterations)`);
      console.log(`    Min time: ${formatTime(minTime)}`);
      console.log(`    Max time: ${formatTime(maxTime)}`);
    }
    console.log('');
  }
}

async function analyzeIndexCreation(loadedData) {
  console.log('\n=== INDEX CREATION ANALYSIS ===\n');

  const datasets = {
    airports: loadedData['airports.json'].data,
    airlines: loadedData['airlines.json'].data.filter(a => a.iataCode != null),
    aircraft: loadedData['aircraft.json'].data,
  };

  for (const [dataType, data] of Object.entries(datasets)) {
    console.log(`${dataType.toUpperCase()}:`);

    // Measure Map index creation
    const mapStart = performance.now();
    const mapIndex = new Map();
    data.forEach(item => {
      const code = item.iataCode.toLowerCase();
      if (!mapIndex.has(code)) {
        mapIndex.set(code, []);
      }
      mapIndex.get(code).push(item);
    });
    const mapTime = performance.now() - mapStart;

    // Measure prefix trie creation (2-level for optimization)
    const trieStart = performance.now();
    const trieIndex = {};
    data.forEach(item => {
      const code = item.iataCode.toLowerCase();
      const prefix1 = code[0] || '';
      const prefix2 = code.substring(0, 2);

      if (!trieIndex[prefix1]) trieIndex[prefix1] = [];
      trieIndex[prefix1].push(item);
    });
    const trieTime = performance.now() - trieStart;

    console.log(`  Map index creation: ${formatTime(mapTime)}`);
    console.log(`  Map index size: ${mapIndex.size} unique codes`);
    console.log(`  Trie index creation: ${formatTime(trieTime)}`);
    console.log(`  Trie index size: ${Object.keys(trieIndex).length} prefixes`);
    console.log('');
  }
}

async function analyzeTransformationAlternatives(loadedData) {
  console.log('\n=== TRANSFORMATION ALTERNATIVES ANALYSIS ===\n');

  const rawData = loadedData['airports.json'].data;
  const sampleSize = 1000;
  const sample = rawData.slice(0, sampleSize);

  // Current approach: Object.fromEntries + map
  const currentStart = performance.now();
  for (let i = 0; i < 100; i++) {
    sample.map(obj => 
      Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [snakeCaseToCamelCase(key), value])
      )
    );
  }
  const currentTime = performance.now() - currentStart;

  // Alternative 1: Direct object creation
  const alt1Start = performance.now();
  for (let i = 0; i < 100; i++) {
    sample.map(obj => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[snakeCaseToCamelCase(key)] = value;
      }
      return result;
    });
  }
  const alt1Time = performance.now() - alt1Start;

  // Alternative 2: Pre-computed key mappings
  const keyMap = new Map([
    ['iata_code', 'iataCode'],
    ['iata_country_code', 'iataCountryCode'],
    ['iata_city_code', 'iataCityCode'],
    ['icao_code', 'icaoCode'],
    ['city_name', 'cityName'],
    ['time_zone', 'timeZone'],
  ]);

  const alt2Start = performance.now();
  for (let i = 0; i < 100; i++) {
    sample.map(obj => {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[keyMap.get(key) || key] = value;
      }
      return result;
    });
  }
  const alt2Time = performance.now() - alt2Start;

  console.log('Transformation performance (100 iterations on 1000 records):');
  console.log(`  Current (Object.fromEntries): ${formatTime(currentTime)}`);
  console.log(`  Alternative 1 (Direct): ${formatTime(alt1Time)} (${((currentTime - alt1Time) / currentTime * 100).toFixed(1)}% ${alt1Time < currentTime ? 'faster' : 'slower'})`);
  console.log(`  Alternative 2 (Pre-mapped): ${formatTime(alt2Time)} (${((currentTime - alt2Time) / currentTime * 100).toFixed(1)}% ${alt2Time < currentTime ? 'faster' : 'slower'})`);
  console.log('');
}

async function main() {
  console.log('IATA Code Decoder API - Performance Analysis');
  console.log('=============================================');

  const memStart = getMemoryUsage();
  console.log(`\nInitial memory usage: ${formatBytes(memStart.heapUsed)}`);

  const loadedData = await analyzeDataLoading();
  await analyzeFiltering(loadedData);
  await analyzeIndexCreation(loadedData);
  await analyzeTransformationAlternatives(loadedData);

  const memEnd = getMemoryUsage();
  console.log('\n=== OVERALL MEMORY USAGE ===\n');
  console.log(`Initial heap: ${formatBytes(memStart.heapUsed)}`);
  console.log(`Final heap: ${formatBytes(memEnd.heapUsed)}`);
  console.log(`Increase: ${formatBytes(memEnd.heapUsed - memStart.heapUsed)}`);
  console.log(`RSS: ${formatBytes(memEnd.rss)}`);
}

main().catch(console.error);
