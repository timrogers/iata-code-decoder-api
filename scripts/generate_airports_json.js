#!/usr/bin/node

import * as dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Duffel } from '@duffel/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../', 'data', 'airports.json');

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Convert snake_case object keys to camelCase at data-generation time
// so the API runtime avoids doing this transformation on every startup.
const convertKeyCase = (s) => s.replace(/_([a-z])/gi, (_, c) => c.toUpperCase());
const reshapeKeys = (o) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [convertKeyCase(k), v]));

const fetchAndWriteAirports = async () => {
  let airports = [];

  for await (const airportResponse of duffel.airports.listWithGenerator()) {
    console.log(`Loaded airport ${airportResponse.data.iata_code} ✅`);

    // Pre-transform keys to camelCase so the API skips this at startup
    const entry = reshapeKeys(airportResponse.data);
    if (entry.city) {
      entry.city = reshapeKeys(entry.city);
    }
    airports.push(entry);

    // We artificially sleep after each airport - even though each response
    // contains many airports - just to avoid hitting the rate limit and
    // exploding. The Duffel library doesn't make that easy to handle right
    // now!
    await sleep(10);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(airports));
};

fetchAndWriteAirports()
  .then(() => console.log(`Wrote airports data to ${OUTPUT_PATH}`))
  .catch(console.error);
