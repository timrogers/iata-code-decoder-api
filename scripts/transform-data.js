#!/usr/bin/env node

/**
 * Pre-transform data files to camelCase for faster runtime performance
 * This eliminates the need to transform data on every server start
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const cameliseKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

const transformAirport = (airport) => {
  const camelised = cameliseKeys(airport);
  if (camelised.city) {
    return Object.assign(camelised, {
      city: cameliseKeys(camelised.city),
    });
  }
  return camelised;
};

const transformFile = (inputPath, outputPath, transformer = cameliseKeys) => {
  console.log(`Transforming ${inputPath}...`);
  const data = JSON.parse(readFileSync(inputPath, 'utf-8'));
  const transformed = Array.isArray(data) ? data.map(transformer) : transformer(data);
  writeFileSync(outputPath, JSON.stringify(transformed, null, 2));
  console.log(`✓ Written to ${outputPath}`);
};

const dataDir = join(__dirname, '..', 'data');

// Transform airports with special handling for nested city
transformFile(
  join(dataDir, 'airports.json'),
  join(dataDir, 'airports.transformed.json'),
  transformAirport,
);

// Transform airlines with filtering for IATA code
const airlinesData = JSON.parse(readFileSync(join(dataDir, 'airlines.json'), 'utf-8'));
const transformedAirlines = airlinesData
  .map(cameliseKeys)
  .filter((airline) => airline.iataCode !== undefined && airline.iataCode !== null);
writeFileSync(
  join(dataDir, 'airlines.transformed.json'),
  JSON.stringify(transformedAirlines, null, 2),
);
console.log('✓ Transformed airlines.json');

// Transform aircraft
transformFile(join(dataDir, 'aircraft.json'), join(dataDir, 'aircraft.transformed.json'));

console.log('\n✅ All data files transformed successfully');
