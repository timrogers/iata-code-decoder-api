#!/usr/bin/node

require('dotenv').config()
const { promises: fs } = require('fs');
const path = require('path');
const { Duffel } = require('@duffel/api');

const OUTPUT_PATH = path.join(__dirname, '../', 'data', 'airlines.json');

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchAndWriteAirlines = async () => {
  let airlines = [];

  for await (const airlineResponse of duffel.airlines.listWithGenerator()) {
    console.log(`Loaded airline ${airlineResponse.data.iata_code} ✅`);
    
    // `airlineResponse` can contain properties that aren't defined in the
    // `Airline` type. If this is the case, they'll still be included in our
    // list and written to the file.
    airlines.push(airlineResponse.data);

    // We artificially sleep after each airport - even though each response
    // contains many airports - just to avoid hitting the rate limit and
    // exploding. The Duffel library doesn't make that easy to handle right
    // now!
    await sleep(10);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(airlines));
}

fetchAndWriteAirlines()
  .then(() => console.log(`Wrote airlines data to ${OUTPUT_PATH}`))
  .catch(console.error);