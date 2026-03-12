#!/usr/bin/node

/**
 * One-time migration script to convert existing JSON data files from
 * snake_case keys to camelCase keys. This eliminates the need for
 * runtime key transformation on every server startup.
 *
 * Run with: node scripts/convert_keys_to_camelcase.js
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');

const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const cameliseKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

async function convertFile(filename, transformRecord) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await fs.readFile(filePath, 'utf8');
  const records = JSON.parse(raw);

  const converted = records.map(transformRecord);
  await fs.writeFile(filePath, JSON.stringify(converted));

  console.log(`✅ Converted ${filename}: ${records.length} records`);
}

// Airports: camelise top-level keys and nested city object
await convertFile('airports.json', (airport) => {
  const camelised = cameliseKeys(airport);
  if (camelised.city) {
    camelised.city = cameliseKeys(camelised.city);
  }
  return camelised;
});

// Airlines: camelise keys (filtering is done at import time, not here)
await convertFile('airlines.json', cameliseKeys);

// Aircraft: camelise keys
await convertFile('aircraft.json', cameliseKeys);

console.log('\n🎉 All data files converted to camelCase keys.');
