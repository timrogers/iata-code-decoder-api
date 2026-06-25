import { Airline, Keyable } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Keyable): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null;

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = AIRLINES_DATA.map((airline) => {
      const camelised = cameliseKeys(airline) as Airline;
      // Ensure all required fields from airlineSchema are present
      return {
        id: camelised.id,
        iataCode: camelised.iataCode,
        name: camelised.name,
      };
    }).filter(hasIataCode) as Airline[];
  }

  return airlines;
};
