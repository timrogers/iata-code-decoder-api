import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = (AIRCRAFT_DATA as Record<string, unknown>[]).map((aircraft) => ({
      id: aircraft.id as string,
      iataCode: aircraft.iata_code as string,
      name: aircraft.name as string,
    }));
  }

  return aircraft;
};
