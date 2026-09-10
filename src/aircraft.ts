import { createRequire } from 'module';
import { Aircraft } from './types.js';
import { cameliseKeys } from './utils.js';

const require = createRequire(import.meta.url);

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    const AIRCRAFT_DATA: object[] = require('./../data/aircraft.json');
    aircraft = AIRCRAFT_DATA.map(cameliseKeys) as Aircraft[];
  }

  return aircraft;
};
