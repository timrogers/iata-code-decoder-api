import { Airline, Keyable } from './types.js';
import * as fs from 'node:fs';
import { cameliseKeys } from './utils.js';

const AIRLINES_DATA_URL = new URL('../data/airlines.json', import.meta.url);

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    const airlinesData = JSON.parse(
      fs.readFileSync(AIRLINES_DATA_URL, 'utf-8'),
    ) as Keyable[];
    airlines = airlinesData.map(cameliseKeys).filter(hasIataCode) as Airline[];
  }

  return airlines;
};
