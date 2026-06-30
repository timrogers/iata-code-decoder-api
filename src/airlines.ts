import { Airline } from './types.js';
import AIRLINES_DATA from './../data/airlines.json' with { type: 'json' };

let airlines: Airline[] | undefined;

export const getAirlines = (): Airline[] => {
  if (!airlines) {
    airlines = (AIRLINES_DATA as Record<string, unknown>[])
      .filter((data) => data.iata_code !== undefined && data.iata_code !== null)
      .map((data) => ({
        id: data.id as string,
        iataCode: data.iata_code as string,
        name: data.name as string,
      }));
  }

  return airlines;
};
