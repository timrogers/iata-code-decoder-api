#!/usr/bin/node

import * as dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Duffel } from '@duffel/api';
import { deepCameliseKeys } from './camelise_utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../', 'data', 'airports.json');

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndWriteAirports = async () => {
  let airports = [];

  for await (const airportResponse of duffel.airports.listWithGenerator()) {
    console.log(`Loaded airport ${airportResponse.data.iata_code} ✅`);

    // `airportResponse` can contain properties that aren't defined in the
    // `Airline` type. If this is the case, they'll still be included in our
    // list and written to the file.
    airports.push(deepCameliseKeys(airportResponse.data));

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
