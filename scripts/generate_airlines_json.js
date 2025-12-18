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

const snakeCaseToCamelCase = (string) =>
  string.replace(/(_[a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const cameliseKeys = (object) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [snakeCaseToCamelCase(key), value]),
  );

const fetchAndWriteAirlines = async () => {
  let airlines = [];

  for await (const airlineResponse of duffel.airlines.listWithGenerator()) {
    console.log(`Loaded airline ${airlineResponse.data.iata_code} ✅`);

    // `airlineResponse` can contain properties that aren't defined in the
    // `Airline` type. If this is the case, they'll still be included in our
    // list and written to the file.
    airlines.push(cameliseKeys(airlineResponse.data));

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
