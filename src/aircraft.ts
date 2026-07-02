import { Aircraft } from './types.js';
import { createRequire } from 'node:module';
import { cameliseKeys } from './utils.js';

const require = createRequire(import.meta.url);

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    const aircraftData = require('../data/aircraft.json') as object[];
    aircraft = aircraftData.map(cameliseKeys) as Aircraft[];
  }

  return aircraft;
};
