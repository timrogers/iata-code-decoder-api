import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map((aircraft) => {
      const camelised = cameliseKeys(aircraft) as Aircraft;
      return {
        ...camelised,
        id: camelised.id ?? null,
        iataCode: camelised.iataCode ?? null,
        name: camelised.name ?? null,
      };
    }) as Aircraft[];
  }

  return aircraft;
};
