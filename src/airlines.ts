import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

const airlineDataToAirline = (airline: Record<string, unknown>): Airline => {
  return {
    id: airline.id as string,
    iataCode: airline.iata_code as string,
    name: airline.name as string,
  };
};

// We want to filter out airlines returned by the Duffel API with no IATA code,
// since these aren't useful for IATA code decoding
const hasIataCode = (airline: Record<string, unknown>): boolean =>
  airline.iata_code !== undefined && airline.iata_code !== null;

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = (AIRLINES_DATA as Record<string, unknown>[])
      .filter(hasIataCode)
      .map(airlineDataToAirline);
  }

  return airlines;
};
