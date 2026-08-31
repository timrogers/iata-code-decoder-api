import { Airport } from './types.js';
import * as fs from 'node:fs';
import { cameliseKeys } from './utils.js';

const AIRPORTS_DATA_URL = new URL('../data/airports.json', import.meta.url);

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport;

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as Airport;
  } else {
    return camelisedAirport as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    const airportsData = JSON.parse(
      fs.readFileSync(AIRPORTS_DATA_URL, 'utf-8'),
    ) as object[];
    airports = airportsData.map(airportDataToAirport);
  }

  return airports;
};
