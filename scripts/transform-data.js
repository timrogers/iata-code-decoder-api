#!/usr/bin/env node
/**
 * Script to pre-transform data files from snake_case to camelCase
 * Run this during build to eliminate runtime transformation overhead
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', '')
  );

const cameliseKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value])
  );

const transformAirport = (airport) => {
  const camelisedAirport = cameliseKeys(airport);
  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    });
  }
  return camelisedAirport;
};

const transformAirline = (airline) => {
  return cameliseKeys(airline);
};

const transformAircraft = (aircraft) => {
  return cameliseKeys(aircraft);
};

const transformFile = (inputPath, outputPath, transformer, filterFn = null) => {
  console.log(`Transforming ${inputPath}...`);
  const startTime = Date.now();
  
  const data = JSON.parse(readFileSync(inputPath, 'utf8'));
  let transformed = data.map(transformer);
  
  if (filterFn) {
    const originalLength = transformed.length;
    transformed = transformed.filter(filterFn);
    console.log(`  Filtered: ${originalLength} -> ${transformed.length} records`);
  }
  
  writeFileSync(outputPath, JSON.stringify(transformed, null, 0));
  
  const elapsed = Date.now() - startTime;
  const inputSize = (readFileSync(inputPath).length / 1024).toFixed(0);
  const outputSize = (readFileSync(outputPath).length / 1024).toFixed(0);
  
  console.log(`  ✓ Complete: ${transformed.length} records, ${inputSize}KB -> ${outputSize}KB in ${elapsed}ms`);
};

console.log('🔧 Pre-transforming data files...\n');

const dataDir = join(__dirname, '..', 'data');
const transformedDir = join(dataDir, 'transformed');

// Create transformed directory if it doesn't exist
if (!existsSync(transformedDir)) {
  mkdirSync(transformedDir, { recursive: true });
  console.log(`Created directory: ${transformedDir}\n`);
}

// Transform all data files
transformFile(
  join(dataDir, 'airports.json'),
  join(transformedDir, 'airports.json'),
  transformAirport
);

transformFile(
  join(dataDir, 'airlines.json'),
  join(transformedDir, 'airlines.json'),
  transformAirline,
  // Filter out airlines with no IATA code
  (airline) => airline.iataCode !== undefined && airline.iataCode !== null
);

transformFile(
  join(dataDir, 'aircraft.json'),
  join(transformedDir, 'aircraft.json'),
  transformAircraft
);

console.log('\n✅ All data files transformed successfully!');
