import { Airline, Keyable } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airlineDataToAirline = (airline: object): Airline => {
  const camelisedAirline = cameliseKeys(airline) as Airline;

  return {
    id: camelisedAirline.id ?? '',
    iataCode: camelisedAirline.iataCode ?? '',
    name: camelisedAirline.name ?? '',
  };
};

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Airline): boolean =>
  airline.iataCode !== undefined && airline.iataCode !== null && airline.iataCode !== '';

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = AIRLINES_DATA.map(airlineDataToAirline).filter(hasIataCode);
  }

  return airlines;
};
