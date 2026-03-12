#!/usr/bin/node

import * as dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Duffel } from '@duffel/api';
import { toCamelCaseKeys } from './camelise_helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../', 'data', 'aircraft.json');

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndWriteAircraft = async () => {
  let aircraft = [];

  for await (const aircraftResponse of duffel.aircraft.listWithGenerator()) {
    console.log(`Loaded aircraft ${aircraftResponse.data.iata_code} ✅`);

    // Convert keys to camelCase at generation time so the server skips
    // runtime transformation on startup.
    aircraft.push(toCamelCaseKeys(aircraftResponse.data));

    // We artificially sleep after each airport - even though each response
    // contains many airports - just to avoid hitting the rate limit and
    // exploding. The Duffel library doesn't make that easy to handle right
    // now!
    await sleep(10);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(aircraft));
};

fetchAndWriteAircraft()
  .then(() => console.log(`Wrote aircraft data to ${OUTPUT_PATH}`))
  .catch(console.error);
