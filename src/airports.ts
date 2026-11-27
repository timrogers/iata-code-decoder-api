import { Airport } from './types.js';
import AIRPORTS_DATA from './../data/airports.json' with { type: 'json' };
import { cameliseKeys } from './utils.js';

const airportDataToAirport = (airport: object): Airport => {
  const camelisedAirport = cameliseKeys(airport) as Airport & {
    timeZone?: string;
  };

  // Restore the time_zone property which is camelised to timeZone
  if (camelisedAirport.timeZone) {
    camelisedAirport.time_zone = camelisedAirport.timeZone;
  }

  if (camelisedAirport.city) {
    return Object.assign(camelisedAirport, {
      city: cameliseKeys(camelisedAirport.city),
    }) as Airport;
  } else {
    return camelisedAirport as Airport;
  }
};

let airports: Airport[] | undefined;

export const getAirports = (): Airport[] => {
  if (!airports) {
    airports = (AIRPORTS_DATA as object[]).map(airportDataToAirport);
  }

  return airports;
};
