#!/usr/bin/node

import * as dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Duffel } from '@duffel/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../', 'data', 'airlines.json');

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Convert snake_case object keys to camelCase at data-generation time
// so the API runtime avoids doing this transformation on every startup.
const convertKeyCase = (s) => s.replace(/_([a-z])/gi, (_, c) => c.toUpperCase());
const reshapeKeys = (o) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [convertKeyCase(k), v]));

const fetchAndWriteAirlines = async () => {
  let airlines = [];

  for await (const airlineResponse of duffel.airlines.listWithGenerator()) {
    console.log(`Loaded airline ${airlineResponse.data.iata_code} ✅`);

    // Pre-transform keys to camelCase and filter out entries with no IATA code
    const entry = reshapeKeys(airlineResponse.data);
    if (entry.iataCode !== undefined && entry.iataCode !== null) {
      airlines.push(entry);
    }

    // We artificially sleep after each airport - even though each response
    // contains many airports - just to avoid hitting the rate limit and
    // exploding. The Duffel library doesn't make that easy to handle right
    // now!
    await sleep(10);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(airlines));
};

fetchAndWriteAirlines()
  .then(() => console.log(`Wrote airlines data to ${OUTPUT_PATH}`))
  .catch(console.error);
