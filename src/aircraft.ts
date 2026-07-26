import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = (AIRCRAFT_DATA as Record<string, unknown>[]).map((item) => ({
      id: item.id as string,
      iataCode: item.iata_code as string,
      name: item.name as string,
    }));
  }

  return aircraft;
};
