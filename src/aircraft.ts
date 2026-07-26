import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const aircraftDataToAircraft = (item: object): Aircraft => {
  const camelisedAircraft = cameliseKeys(item) as Aircraft;

  return {
    id: camelisedAircraft.id ?? '',
    iataCode: camelisedAircraft.iataCode ?? '',
    name: camelisedAircraft.name ?? '',
  };
};

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map(aircraftDataToAircraft);
  }

  return aircraft;
};
