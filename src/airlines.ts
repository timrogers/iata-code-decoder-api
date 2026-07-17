import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
/* eslint-disable @typescript-eslint/no-explicit-any */
const hasIataCode = (airline: any): boolean =>
  airline.iata_code !== undefined && airline.iata_code !== null;

const airlineDataToAirline = (airline: any): Airline => {
  return {
    id: airline.id,
    iataCode: airline.iata_code,
    name: airline.name,
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = AIRLINES_DATA.filter(hasIataCode).map(airlineDataToAirline);
  }

  return airlines;
};
