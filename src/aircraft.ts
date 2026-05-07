import { Aircraft } from './types.js';
import AIRCRAFT_DATA from './../data/aircraft.json' with { type: 'json' };

interface RawAircraft {
  iata_code: string;
  id: string;
  name: string;
}

const aircraftDataToAircraft = (aircraft: RawAircraft): Aircraft =>
  ({
    iataCode: aircraft.iata_code,
    id: aircraft.id,
    name: aircraft.name,
  }) as Aircraft;

let aircraft: Aircraft[] | undefined;

export const getAircraft = (): Aircraft[] => {
  if (!aircraft) {
    aircraft = AIRCRAFT_DATA.map((entry) => aircraftDataToAircraft(entry as RawAircraft));
  }

  return aircraft;
};
