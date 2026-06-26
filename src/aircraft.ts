import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map(cameliseKeys).map((aircraft) => {
      const a = aircraft as Aircraft;
      return {
        id: a.id,
        iataCode: a.iataCode,
        name: a.name,
      };
    });
  }

  return aircraft;
};
