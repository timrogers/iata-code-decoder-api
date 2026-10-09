import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = (AIRLINES_DATA as Record<string, unknown>[])
      .filter((airline) => airline.iata_code !== undefined && airline.iata_code !== null)
      .map((airline) => ({
        id: airline.id as string,
        iataCode: airline.iata_code as string,
        name: airline.name as string,
      }));
  }

  return airlines;
};
