import { Aircraft } from './types.js';
import * as fs from 'node:fs';
import { cameliseKeys } from './utils.js';

const AIRCRAFT_DATA_URL = new URL('../data/aircraft.json', import.meta.url);

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    const aircraftData = JSON.parse(
      fs.readFileSync(AIRCRAFT_DATA_URL, 'utf-8'),
    ) as object[];
    aircraft = aircraftData.map(cameliseKeys) as Aircraft[];
  }

  return aircraft;
};
