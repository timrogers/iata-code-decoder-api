import { Aircraft } from './types.js';
import { createRequire } from 'node:module';
import { cameliseKeys } from './utils.js';

let aircraft: Aircraft[] | undefined;
let aircraftData: object[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    if (!aircraftData) {
      const require = createRequire(import.meta.url);
      aircraftData = require('./../data/aircraft.json') as object[];
    }

    aircraft = aircraftData.map(cameliseKeys) as Aircraft[];
  }

  return aircraft;
};
