import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map((item) => {
      const camelised = cameliseKeys(item) as Aircraft;
      // Ensure all required fields from aircraftSchema are present
      return {
        id: camelised.id,
        iataCode: camelised.iataCode,
        name: camelised.name,
      };
    }) as Aircraft[];
  }

  return aircraft;
};
