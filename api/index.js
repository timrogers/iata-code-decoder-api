const express = require('express');
const { Duffel } = require('@duffel/api');

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN,
  debug: { verbose: true }
});

const app = express();

app.get('/airports', async (req, res) => {
  let airports = [];

  for await (const airportResponse of duffel.airports.listWithGenerator()) {
    airports.push(airportResponse.data);

    // We artificially sleep after each airport - even though each response
    // contains many airports - just to avoid hitting the rate limit and
    // exploding. The Duffel library doesn't make that easy to handle right
    // now!
    await sleep(5);
  }

  res.set('Content-Type', 'application/json');
  res.set('Cache-Control', `public, max-age=${ONE_DAY_IN_SECONDS}`);
  res.send(JSON.stringify(airports));
})

const port = process.env.PORT;

module.exports = app;