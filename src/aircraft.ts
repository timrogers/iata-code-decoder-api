import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = (AIRCRAFT_DATA as Record<string, unknown>[]).map((data) => ({
      id: data.id as string,
      iataCode: data.iata_code as string,
      name: data.name as string,
    })) as Aircraft[];
  }

  return aircraft;
};
