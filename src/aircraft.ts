import { createRequire } from 'module';
import { Aircraft } from './types.js';
import { cameliseKeys } from './utils.js';

const require = createRequire(import.meta.url);

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    const data = require('../data/aircraft.json') as object[];
    aircraft = data.map(cameliseKeys) as Aircraft[];
  }

  return aircraft;
};
